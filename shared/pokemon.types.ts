export interface PokemonType {
	name: string;
	image: string;
}

export interface StatBlock {
	HP: number;
	attack: number;
	defense: number;
	special_attack: number;
	special_defense: number;
	speed: number;
}

export type DamageRelation =
	| "neutral"
	| "resistant"
	| "twice_resistant"
	| "vulnerable"
	| "twice_vulnerable"
	| "immune";

export interface Resistance {
	name: string;
	damage_multiplier: number;
	damage_relation: DamageRelation;
}

export interface Ability {
	name: string;
	slug: string;
}

export interface Evolution {
	name: string;
	pokedexId: number;
}

export interface Pokemon {
	id: number;
	name: string;
	image: string;
	stats: Pick<StatBlock, "HP" | "attack" | "defense" | "speed">;
	apiTypes: PokemonType[];
}

export interface PokemonWithDetails extends Pokemon {
	pokedexId: number;
	sprite: string;
	slug: string;
	stats: StatBlock;
	apiGeneration: number;
	apiResistances: Resistance[];
	resistanceModifyingAbilitiesForApi: Ability;
	apiEvolutions: Evolution[];
	apiPreEvolution: string | "none";
	apiResistancesWithAbilities: Resistance[];
}
export interface PokemonListParams {
	page: number;
	limit: number;
	name?: string;
	type?: string;
}

export interface PokemonTypesResponse {
	types: string[];
}

export interface PokemonListResponse {
	pokemons: Pokemon[];
	total: number;
	page: number;
	limit: number;
}
