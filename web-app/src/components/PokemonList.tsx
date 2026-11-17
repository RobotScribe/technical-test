import React from 'react'
import { useTheme } from './theme'
import Card from './Card'
import { StateMessage } from '../design-system'
import type { Pokemon } from '@shared/types/pokemon.types'

interface PokemonListProps {
	pokemons: Pokemon[]
	selectedIds: number[]
	onSelect: (pokemon: Pokemon) => void
}

const PokemonList: React.FC<PokemonListProps> = ({ pokemons, selectedIds, onSelect }) => {
	const { theme } = useTheme()

	if (pokemons.length === 0) {
		return <StateMessage>No Pokemon found</StateMessage>
	}

	return (
		<div
			className={`p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 place-items-center ${theme === 'light' ? '' : 'bg-slate-800'}`}
		>
			{pokemons.map((p) => (
				<Card
					key={p.id}
					pokemon={p}
					selected={selectedIds.includes(p.id)}
					onSelect={() => onSelect(p)}
				/>
			))}
		</div>
	)
}

export default PokemonList
