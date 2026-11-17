import React from 'react'
import { useQuery } from '@tanstack/react-query'
import PokemonList from './PokemonList'
import PokemonFilters from './PokemonFilters'
import Pagination from './Pagination'
import SelectionBar from './SelectionBar'
import { Header } from './Header'
import { useTheme } from './theme'
import { Button, StateMessage } from '../design-system'
import { pokemonsQueryOptions } from '../queries/pokemon.queries'
import { usePokemonSearch } from '../hooks/usePokemonSearch'
import { usePokemonSelection } from '../hooks/usePokemonSelection'

const PAGE_SIZE = 24

const PokemonApp: React.FC = () => {
	const { theme } = useTheme()
	const { search, setSearch, debouncedSearch, type, setType, page, setPage } = usePokemonSearch()
	const { data, isPending, isError, isPlaceholderData, refetch } = useQuery(
		pokemonsQueryOptions({
			page,
			limit: PAGE_SIZE,
			name: debouncedSearch,
			type: type ?? undefined,
		}),
	)
	const { selected, toggle, clear } = usePokemonSelection()

	const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0

	return (
		<div
			className={`${theme === 'light' ? 'bg-amber-50' : 'bg-slate-800'} min-h-screen flex flex-col items-center`}
		>
			<Header />
			<PokemonFilters
				search={search}
				onSearchChange={setSearch}
				type={type}
				onTypeChange={setType}
			/>
			{isPending && <StateMessage>Loading Pokemons...</StateMessage>}
			{isError && (
				<div className="flex flex-col items-center gap-4">
					<StateMessage className="pb-0">Unable to load the Pokemons</StateMessage>
					<Button onClick={() => void refetch()}>Retry</Button>
				</div>
			)}
			{data && (
				<div className={isPlaceholderData ? 'opacity-50 transition-opacity' : ''}>
					<PokemonList
						pokemons={data.pokemons}
						selectedIds={selected.map((p) => p.id)}
						onSelect={toggle}
					/>
				</div>
			)}
			{data && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
			<div className="pb-20" />
			<SelectionBar selected={selected} onClear={clear} />
		</div>
	)
}

export default PokemonApp
