import type {
	DamageRelation,
	Evolution,
	PokemonListParams,
	PokemonListResponse,
	PokemonType,
	PokemonWithDetails,
	Resistance,
} from '@shared/types/pokemon.types'
import type { ApiChainLink, ApiPokemon, ApiType } from '../clients/pokeapi.types'
import {
	getEvolutionChain,
	getPokemon,
	getAllPokemons,
	getAllTypes,
	getSpecies,
	getType,
} from '../clients/pokeapi.client'
import { memoizeAsyncOnce } from '../utils/async'

const DAMAGE_RELATIONS: Record<number, DamageRelation> = {
	0: 'immune',
	0.25: 'twice_resistant',
	0.5: 'resistant',
	1: 'neutral',
	2: 'vulnerable',
	4: 'twice_vulnerable',
}

/** Extract the trailing id from a PokeAPI resource url (e.g. .../generation/1/) */
const idFromUrl = (url: string): number => Number(url.split('/').filter(Boolean).pop())

// The list of types is the same for every pokemon: it is only fetched once
export const getTypeNames = memoizeAsyncOnce(async (): Promise<string[]> => {
	const { count } = await getAllTypes({ limit: 1 })
	const { results } = await getAllTypes({ limit: count })
	return results.map(({ name }) => name)
})

const getAllPokemonResources = async () => {
	const { count } = await getAllPokemons({ limit: 1 })
	const { results } = await getAllPokemons({ limit: count })
	return results
}

const getAllTypesByNames = (types: string[]): Promise<ApiType[]> =>
	Promise.all(types.map((type) => getType(type)))

const toPokemonTypes = (types: ApiType[]): PokemonType[] =>
	types.map((type) => ({
		name: type.name,
		image: type.sprites['generation-viii']['sword-shield'].name_icon ?? '',
	}))

const baseStat = (pokemon: ApiPokemon, name: string): number =>
	pokemon.stats.find((s) => s.stat.name === name)?.base_stat ?? 0

const officialArtwork = (pokemon: ApiPokemon): string =>
	pokemon.sprites.other['official-artwork'].front_default ?? ''

export const getPokemonsList = async ({
	page,
	limit,
	name,
	type,
}: PokemonListParams): Promise<PokemonListResponse> => {
	const query = name?.trim().toLowerCase() ?? ''
	const [allResources, pokemonNamesFromType] = await Promise.all([
		getAllPokemonResources(), // We have to fetch all pokemons because PokeAPI doesn't support searching by name
		type
			? getType(type).then(({ pokemon }) => new Set(pokemon.map((p) => p.pokemon.name)))
			: undefined,
	])
	const resources = allResources.filter(
		(resource) =>
			resource.name.includes(query) &&
			(!pokemonNamesFromType || pokemonNamesFromType.has(resource.name)),
	)

	const start = (page - 1) * limit
	const pokemons = await Promise.all(
		// We have to fetch pokemons one by one because PokeAPI doesn't support bulk with details
		resources.slice(start, start + limit).map(({ url }) => getPokemon(idFromUrl(url))),
	)

	const allTypeNames = new Set(
		pokemons.flatMap((pokemon) => pokemon.types.map((pokemonType) => pokemonType.type.name)),
	)
	const types = await getAllTypesByNames(Array.from(allTypeNames))

	const typesByNames = types.reduce<Record<string, ApiType>>((acc, currentType) => {
		acc[currentType.name] = currentType
		return acc
	}, {})

	const formattedPokemons = pokemons.map((pokemon) => {
		return {
			id: pokemon.id,
			name: pokemon.name,
			image: officialArtwork(pokemon),
			stats: {
				HP: baseStat(pokemon, 'hp'),
				attack: baseStat(pokemon, 'attack'),
				defense: baseStat(pokemon, 'defense'),
				speed: baseStat(pokemon, 'speed'),
			},
			apiTypes: toPokemonTypes(
				pokemon.types
					.map((pokemonType) => typesByNames[pokemonType.type.name])
					.filter((pokemonType) => pokemonType !== undefined),
			),
		}
	})

	return { pokemons: formattedPokemons, total: resources.length, page, limit }
}

const computeResistances = (types: ApiType[], attackingTypes: string[]): Resistance[] =>
	attackingTypes.map((attacker) => {
		const damage_multiplier = types.reduce((multiplier, { damage_relations: relations }) => {
			if (relations.no_damage_from.some((t) => t.name === attacker)) return 0
			if (relations.double_damage_from.some((t) => t.name === attacker)) return multiplier * 2
			if (relations.half_damage_from.some((t) => t.name === attacker)) return multiplier * 0.5
			return multiplier
		}, 1)

		const damage_relation = DAMAGE_RELATIONS[damage_multiplier] ?? 'neutral'

		return { name: attacker, damage_multiplier, damage_relation }
	})

const findChainLink = (link: ApiChainLink, speciesName: string): ApiChainLink | undefined =>
	link.species.name === speciesName
		? link
		: link.evolves_to.map((child) => findChainLink(child, speciesName)).find(Boolean)

export const fetchPokemon = async (id: string | number): Promise<PokemonWithDetails> => {
	const pokemon = await getPokemon(id)

	const [types, species, attackingTypes] = await Promise.all([
		getAllTypesByNames(pokemon.types.map((pokemonType) => pokemonType.type.name)),
		getSpecies(pokemon.species.name),
		getTypeNames(),
	])

	const evolutionChain = await getEvolutionChain(species.evolution_chain.url)

	const apiEvolutions: Evolution[] = (
		findChainLink(evolutionChain.chain, species.name)?.evolves_to ?? []
	).map(({ species: evolution }) => ({ name: evolution.name, pokedexId: idFromUrl(evolution.url) }))

	const apiResistances = computeResistances(types, attackingTypes)
	const firstAbility = pokemon.abilities[0]?.ability

	return {
		id: pokemon.id,
		pokedexId: pokemon.id,
		name: pokemon.name,
		image: officialArtwork(pokemon),
		sprite: pokemon.sprites.front_default ?? '',
		slug: pokemon.name,
		stats: {
			HP: baseStat(pokemon, 'hp'),
			attack: baseStat(pokemon, 'attack'),
			defense: baseStat(pokemon, 'defense'),
			special_attack: baseStat(pokemon, 'special-attack'),
			special_defense: baseStat(pokemon, 'special-defense'),
			speed: baseStat(pokemon, 'speed'),
		},
		apiTypes: toPokemonTypes(types),
		apiGeneration: idFromUrl(species.generation.url),
		apiResistances,
		// PokeAPI has no equivalent: best effort with the first ability
		resistanceModifyingAbilitiesForApi: {
			name: firstAbility?.name ?? '',
			slug: firstAbility?.name ?? '',
		},
		apiEvolutions,
		apiPreEvolution: species.evolves_from_species?.name ?? 'none',
		// PokeAPI does not compute ability effects on resistances
		apiResistancesWithAbilities: apiResistances,
	}
}

export const getAllPokemonIds = async (): Promise<number[]> => {
	const resources = await getAllPokemonResources()
	return resources.map(({ url }) => idFromUrl(url))
}
