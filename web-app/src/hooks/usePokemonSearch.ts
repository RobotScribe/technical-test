import { useState } from 'react'
import { useDebouncedValue } from './useDebouncedValue'

export const usePokemonSearch = () => {
	const [search, setSearchValue] = useState('')
	const [type, setTypeValue] = useState<string | null>(null)
	const [page, setPage] = useState(1)
	const debouncedSearch = useDebouncedValue(search)

	const setSearch = (value: string) => {
		setSearchValue(value)
		setPage(1)
	}

	const setType = (value: string | null) => {
		setTypeValue(value)
		setPage(1)
	}

	return { search, setSearch, debouncedSearch, type, setType, page, setPage }
}
