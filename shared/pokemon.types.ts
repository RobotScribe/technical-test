export interface PokemonType {
	name: string
	image: string
}

export interface StatBlock {
	HP: number
	attack: number
	defense: number
	special_attack: number
	special_defense: number
	speed: number
}

export type DamageRelation =
	'neutral' | 'resistant' | 'twice_resistant' | 'vulnerable' | 'twice_vulnerable' | 'immune'

export interface Resistance {
	name: string
	damage_multiplier: number
	damage_relation: DamageRelation
}

export interface Ability {
	name: string
	slug: string
}

export interface Evolution {
	name: string
	pokedexId: number
}

export interface Pokemon {
	id: number
	name: string
	image: string
	stats: Pick<StatBlock, 'HP' | 'attack' | 'defense' | 'speed'>
	apiTypes: PokemonType[]
}

export interface PokemonWithDetails extends Pokemon {
	pokedexId: number
	sprite: string
	slug: string
	stats: StatBlock
	apiGeneration: number
	apiResistances: Resistance[]
	resistanceModifyingAbilitiesForApi: Ability
	apiEvolutions: Evolution[]
	apiPreEvolution: string | 'none'
	apiResistancesWithAbilities: Resistance[]
}
export interface PokemonListParams {
	page: number
	limit: number
	name?: string
	type?: string
}

export interface BattleRequest {
	firstId: number
	secondId: number
}

/** 1 is the first Pokemon of the BattleRequest, 2 the second one */
export type FighterSide = 1 | 2

export interface BattleRoundEvent {
	type: 'round'
	round: number
	attacker: FighterSide
	move: string
	damage: number
	hp1: number
	hp2: number
	text: string
}

export interface BattleWinnerEvent {
	type: 'winner'
	winner: FighterSide
	reason: string
}

/** The battle is streamed as NDJSON: one BattleEvent per line */
export type BattleEvent = BattleRoundEvent | BattleWinnerEvent

export interface PokemonTypesResponse {
	types: string[]
}

export interface PokemonListResponse {
	pokemons: Pokemon[]
	total: number
	page: number
	limit: number
}
