import axios from 'axios'
import type {
	PokemonListParams,
	PokemonListResponse,
	PokemonTypesResponse,
} from '@shared/types/pokemon.types'
import { API_URL } from './config'

export const getPokemons = async (params: PokemonListParams): Promise<PokemonListResponse> => {
	const { data } = await axios.get<PokemonListResponse>(`${API_URL}/pokemons`, { params })
	return data
}

export const getPokemonTypes = async (): Promise<string[]> => {
	const { data } = await axios.get<PokemonTypesResponse>(`${API_URL}/pokemons/types`)
	return data.types
}
