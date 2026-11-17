import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import type { PokemonListParams } from '@shared/types/pokemon.types'
import { getPokemons, getPokemonTypes } from '../api/pokemon.client'

export const pokemonKeys = {
	all: ['pokemons'] as const,
	list: (params: PokemonListParams) => [...pokemonKeys.all, 'list', params] as const,
	types: () => [...pokemonKeys.all, 'types'] as const,
}

export const pokemonTypesQueryOptions = () =>
	queryOptions({
		queryKey: pokemonKeys.types(),
		queryFn: getPokemonTypes,
		staleTime: Infinity,
		refetchOnWindowFocus: false,
	})

export const pokemonsQueryOptions = (params: PokemonListParams) =>
	queryOptions({
		queryKey: pokemonKeys.list(params),
		queryFn: () => getPokemons(params),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	})
