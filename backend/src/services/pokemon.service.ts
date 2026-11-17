import type { PokemonListParams, PokemonListResponse, PokemonType } from '@shared/types/pokemon.types'
import type {  ApiPokemon, ApiType } from '../clients/pokeapi.types'
import {
	getPokemon,
	getAllPokemons,
	getAllTypes,
	getType
} from '../clients/pokeapi.client'


/** Extract the trailing id from a PokeAPI resource url (e.g. .../generation/1/) */
const idFromUrl = (url: string): number => Number(url.split('/').filter(Boolean).pop())

export const getTypeNames = async (): Promise<string[]> => {
	const { count } = await getAllTypes({ limit: 1 })
	const { results } = await getAllTypes({ limit: count })
	return results.map(({ name }) => name)
}

const getAllPokemonResources = async () => {
	const {count} = await getAllPokemons({limit: 1})
	const {results} = await getAllPokemons({limit: count})
	return results
}

const getAllTypesByNames = (types: string[]): Promise<ApiType[]> =>
	Promise.all(
		types.map((type) => getType(type))
	)

const toPokemonTypes = (types: ApiType[]): PokemonType[] =>
	types.map(type => ({
		name: type.name,
		image: type.sprites['generation-viii']['sword-shield'].name_icon ?? ''
	}))

const baseStat = (pokemon: ApiPokemon, name: string): number =>
	pokemon.stats.find(s => s.stat.name === name)?.base_stat ?? 0

const officialArtwork = (pokemon: ApiPokemon): string =>
	pokemon.sprites.other['official-artwork'].front_default ?? ''

export const getPokemonsList = async ({ page, limit, name, type }: PokemonListParams): Promise<PokemonListResponse> => {
	const query = name?.trim().toLowerCase() ?? ''
	const [allResources, pokemonNamesFromType] = await Promise.all([
		getAllPokemonResources(), // We have to fetch all pokemons because PokeAPI doesn't support searching by name
		type ? getType(type).then(({ pokemon }) => new Set(pokemon.map(p => p.pokemon.name))) : undefined
	])
	const resources = allResources.filter(resource =>
		resource.name.includes(query) && (!pokemonNamesFromType || pokemonNamesFromType.has(resource.name))
	)

	const start = (page - 1) * limit
	const pokemons = await Promise.all(
		// We have to fetch pokemons one by one because PokeAPI doesn't support bulk with details
		resources.slice(start, start + limit).map(({ url }) => getPokemon(idFromUrl(url)))
	)

	const allTypeNames = pokemons.flatMap((pokemon) => pokemon.types.map((pokemonType) => pokemonType.type.name))
	const types = await getAllTypesByNames(allTypeNames)

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
				speed: baseStat(pokemon, 'speed')
			},
			apiTypes: toPokemonTypes(pokemon.types.map((pokemonType) => typesByNames[pokemonType.type.name]).filter((pokemonType) => pokemonType !== undefined))
		}
	})

	return { pokemons: formattedPokemons, total: resources.length, page, limit }
}


