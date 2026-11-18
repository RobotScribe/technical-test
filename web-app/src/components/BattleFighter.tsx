import React from 'react'
import type { Pokemon } from '@shared/types/pokemon.types'

export type FighterOutcome = 'fighting' | 'winner' | 'loser'

export interface LastHit {
	round: number
	damage: number
}

interface BattleFighterProps {
	pokemon: Pokemon
	hp: number
	outcome: FighterOutcome
	lastHit: LastHit | null
}

const hpColor = (ratio: number): string => {
	if (ratio > 0.5) return 'bg-green-500'
	if (ratio > 0.2) return 'bg-amber-500'
	return 'bg-red-500'
}

const OUTCOME_CLASSES: Record<FighterOutcome, string> = {
	fighting: '',
	winner: 'scale-105 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]',
	loser: 'opacity-50 grayscale',
}

const BattleFighter: React.FC<BattleFighterProps> = ({ pokemon, hp, outcome, lastHit }) => {
	const maxHp = pokemon.stats.HP
	const ratio = maxHp > 0 ? Math.min(Math.max(hp / maxHp, 0), 1) : 0

	return (
		<div
			className={`flex w-36 flex-col items-center gap-2 transition-all duration-500 sm:w-44 ${OUTCOME_CLASSES[outcome]}`}
		>
			<div className="relative">
				{/* The key restarts the shake each time the pokemon is hit */}
				<div key={lastHit?.round ?? 0} className={lastHit ? 'animate-hit' : ''}>
					<img
						src={pokemon.image}
						alt={pokemon.name}
						className="h-24 w-24 object-contain sm:h-32 sm:w-32"
					/>
				</div>
				{lastHit && lastHit.damage > 0 && (
					<span
						key={`damage-${lastHit.round}`}
						className="animate-damage pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 text-2xl font-extrabold text-red-500 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]"
						aria-hidden="true"
					>
						-{lastHit.damage}
					</span>
				)}
			</div>

			<div className="max-w-full truncate font-bold" title={pokemon.name}>
				{pokemon.name}
			</div>

			<div className="w-full">
				<div
					className="h-3 w-full overflow-hidden rounded-full bg-slate-300"
					role="progressbar"
					aria-label={`${pokemon.name} HP`}
					aria-valuemin={0}
					aria-valuemax={maxHp}
					aria-valuenow={hp}
				>
					<div
						className={`h-full rounded-full transition-all duration-700 ease-out ${hpColor(ratio)}`}
						style={{ width: `${ratio * 100}%` }}
					/>
				</div>
				<div className="mt-1 text-center text-xs font-semibold">
					{hp} / {maxHp} HP
				</div>
			</div>
		</div>
	)
}

export default BattleFighter
