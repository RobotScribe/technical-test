import React from 'react'
import type { Pokemon } from '@shared/types/pokemon.types'
import { MiniCard } from './Card'
import { Button } from '../design-system'

interface SelectionBarProps {
	selected: Pokemon[]
	onClear: () => void
	onFight: () => void
}

const SelectionBar: React.FC<SelectionBarProps> = ({ selected, onClear, onFight }) => {
	if (selected.length === 0) {
		return null
	}

	return (
		<div className="fixed bottom-0 inset-x-0 z-10 bg-amber-100 text-slate-700 shadow-lg p-3 flex flex-wrap items-center justify-center gap-4">
			{selected[0] && <MiniCard pokemon={selected[0]} />}
			<span className="font-bold">VS</span>
			{selected[1] ? <MiniCard pokemon={selected[1]} /> : <span>Select a second Pokemon</span>}
			<Button variant="secondary" size="sm" onClick={onClear} className="bg-white">
				Clear
			</Button>
			<Button size="sm" onClick={onFight} disabled={selected.length < 2}>
				Fight!
			</Button>
		</div>
	)
}

export default SelectionBar
