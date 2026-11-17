import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { pokemonTypesQueryOptions } from '../queries/pokemon.queries'
import { Chip, TextInput } from '../design-system'

interface PokemonFiltersProps {
	search: string
	onSearchChange: (search: string) => void
	type: string | null
	onTypeChange: (type: string | null) => void
}

const PokemonFilters: React.FC<PokemonFiltersProps> = ({
	search,
	onSearchChange,
	type,
	onTypeChange,
}) => {
	const { data: pokemonTypes = [] } = useQuery(pokemonTypesQueryOptions())

	return (
		<div className="w-full max-w-5xl px-4 pt-4 flex flex-col gap-3">
			<TextInput
				type="search"
				value={search}
				onChange={(e) => onSearchChange(e.target.value)}
				placeholder="Search a Pokemon by name..."
				aria-label="Search a Pokemon by name"
			/>
			<div className="flex flex-wrap gap-2">
				{[...pokemonTypes].sort().map((pokemonType) => {
					const isActive = type === pokemonType
					return (
						<Chip
							key={pokemonType}
							selected={isActive}
							onClick={() => onTypeChange(isActive ? null : pokemonType)}
						>
							{pokemonType}
						</Chip>
					)
				})}
			</div>
		</div>
	)
}

export default PokemonFilters
