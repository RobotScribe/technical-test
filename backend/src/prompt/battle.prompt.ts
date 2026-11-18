import type { PokemonWithDetails } from '@shared/types/pokemon.types'

const describe = (pokemon: PokemonWithDetails): string => {
	const { stats } = pokemon
	const types = pokemon.apiTypes.map((type) => type.name).join('/')

	return `${pokemon.name} (${types}) - HP ${stats.HP}, Attack ${stats.attack}, Defense ${stats.defense}, Speed ${stats.speed}`
}

export const battlePrompt = (first: PokemonWithDetails, second: PokemonWithDetails): string =>
	[
		`What happens if ${first.name} fights ${second.name}?`,
		'',
		`Fighter 1: ${describe(first)}`,
		`Fighter 2: ${describe(second)}`,
		'',
		'Instructions:',
		'- Rely on the data sheets of both Pokemon in your knowledge base (types, resistances, base stats).',
		'- Simulate the battle round by round, taking types, resistances and base stats into account.',
		'- Describe each round in one or two sentences.',
		'- Answer in plain text, without tables.',
		'- End with the name of the winner and a short explanation, on a last line starting with "Winner:".',
	].join('\n')
