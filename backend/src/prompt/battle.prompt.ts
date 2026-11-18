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
		`- Fighter 1 starts with ${first.stats.HP} HP and fighter 2 with ${second.stats.HP} HP. The battle ends only when one of them reaches 0 HP: there is no round limit, keep playing rounds until it happens.`,
		'- The fighters attack in turn, the fastest one (Speed) starts. Each round, one fighter uses a real move of its Pokemon.',
		'- Damage must be significant and realistic, never symbolic: a normal hit removes about 15% to 35% of the defender max HP. Scale it with the attacker Attack versus the defender Defense; less if the type is resisted, more if it is super effective or a critical hit; 0 only if the defender is immune or the move misses.',
		'- Never use tiny damage (like 1 or 2 HP) to make the battle last: a battle should end in roughly 4 to 10 rounds, with a knockout.',
		'- Keep the HP consistent: after each round, the HP of the defender is its previous HP minus "damage".',
		'',
		'Output format:',
		'- Answer with NDJSON only: one JSON object per line, no markdown, no code fence, no text outside of the JSON lines.',
		'- One line per round, played in order:',
		'  {"type":"round","round":1,"attacker":1,"move":"Thunderbolt","damage":35,"hp1":100,"hp2":65,"text":"One or two sentences describing the round."}',
		'  "attacker" is 1 or 2 (the fighter who attacks). "damage" is the HP lost by the defender. "hp1" and "hp2" are the HP left to fighter 1 and fighter 2 after the round, never below 0.',
		'- A last line, once the battle is over:',
		'  {"type":"winner","winner":1,"reason":"One short sentence explaining the victory."}',
		'  "winner" is 1 or 2.',
	].join('\n')
