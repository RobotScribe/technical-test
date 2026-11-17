import { useState } from 'react'
import type { Pokemon } from '@shared/types/pokemon.types'

const MAX_SELECTED = 2

/** Select up to two pokemons for the arena. Selecting a third one replaces the oldest. */
export const usePokemonSelection = () => {
	const [selected, setSelected] = useState<Pokemon[]>([])

	const toggle = (pokemon: Pokemon) =>
		setSelected((current) =>
			current.some((p) => p.id === pokemon.id)
				? current.filter((p) => p.id !== pokemon.id)
				: [...current, pokemon].slice(-MAX_SELECTED),
		)

	const clear = () => setSelected([])

	return { selected, toggle, clear }
}
