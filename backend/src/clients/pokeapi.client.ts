import axios from 'axios'
import type {
	ApiEvolutionChain,
	ApiPokemon,
	ApiPokemonList,
	ApiSpecies,
	ApiType,
	ApiTypeList,
} from './pokeapi.types'
import { memoizeAsync, stableKey } from '../utils/async'

const POKEAPI_URL = 'https://pokeapi.co/api/v2'

// Example : https://pokeapi.co/api/v2/pokemon/1/
export const getPokemon = memoizeAsync(
	async (id: string | number): Promise<ApiPokemon> => {
		const { data } = await axios.get<ApiPokemon>(`${POKEAPI_URL}/pokemon/${id}`)
		return data
	},
	(id) => String(id),
)

// Example : https://pokeapi.co/api/v2/pokemon?limit=100&offset=0
export const getAllPokemons = memoizeAsync(
	async ({ limit, offset = 0 }: { limit: number; offset?: number }): Promise<ApiPokemonList> => {
		const { data } = await axios.get<ApiPokemonList>(`${POKEAPI_URL}/pokemon`, {
			params: { limit, offset },
		})
		return data
	},
	({ limit, offset = 0 }) => stableKey({ limit, offset }),
)

// Example : https://pokeapi.co/api/v2/type?limit=100&offset=0
export const getAllTypes = memoizeAsync(
	async ({ limit, offset = 0 }: { limit: number; offset?: number }): Promise<ApiTypeList> => {
		const { data } = await axios.get<ApiTypeList>(`${POKEAPI_URL}/type`, {
			params: { limit, offset },
		})
		return data
	},
	({ limit, offset = 0 }) => stableKey({ limit, offset }),
)

// Example : https://pokeapi.co/api/v2/type/fire/
export const getType = memoizeAsync(async (name: string): Promise<ApiType> => {
	const { data } = await axios.get<ApiType>(`${POKEAPI_URL}/type/${name}`)
	return data
})

// Example : https://pokeapi.co/api/v2/pokemon-species/bulbasaur/
export const getSpecies = memoizeAsync(async (name: string): Promise<ApiSpecies> => {
	const { data } = await axios.get<ApiSpecies>(`${POKEAPI_URL}/pokemon-species/${name}`)
	return data
})

// Example : https://pokeapi.co/api/v2/evolution-chain/1/
export const getEvolutionChain = memoizeAsync(async (url: string): Promise<ApiEvolutionChain> => {
	const { data } = await axios.get<ApiEvolutionChain>(url)
	return data
})
