import React, { useEffect, useMemo, useRef } from 'react'
import type { BattleRoundEvent, FighterSide, Pokemon } from '@shared/types/pokemon.types'
import BattleFighter, { type FighterOutcome, type LastHit } from './BattleFighter'
import { useTheme } from './theme'
import { Button } from '../design-system'
import { useBattle } from '../hooks/useBattle'

interface BattleArenaProps {
	first: Pokemon
	second: Pokemon
	onClose: () => void
	onNewBattle: () => void
}

/** The last round is the only one that hurts a pokemon "right now": it is the one animated */
const lastHitOn = (rounds: BattleRoundEvent[], defender: FighterSide): LastHit | null => {
	const last = rounds[rounds.length - 1]
	if (!last || last.attacker === defender) return null
	return { round: last.round, damage: last.damage }
}

const BattleArena: React.FC<BattleArenaProps> = ({ first, second, onClose, onNewBattle }) => {
	const { theme } = useTheme()
	const { status, rounds, winner, hp, error, start } = useBattle()
	const logRef = useRef<HTMLDivElement>(null)

	// The battle starts as soon as the arena opens
	useEffect(() => {
		void start(first, second)
	}, [start, first, second])

	// Follow the rounds while they are streamed
	useEffect(() => {
		logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
	}, [rounds.length, winner])

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [onClose])

	const isStreaming = status === 'streaming'
	const pokemonOf = (side: FighterSide): Pokemon => (side === 1 ? first : second)
	const winnerPokemon = winner ? pokemonOf(winner.winner) : null

	// Before the first event the hook has no HP yet: both pokemons are at full health
	const currentHp = status === 'idle' ? { first: first.stats.HP, second: second.stats.HP } : hp

	const outcomeOf = (side: FighterSide): FighterOutcome => {
		if (!winner) return 'fighting'
		return winner.winner === side ? 'winner' : 'loser'
	}

	const lastHits = useMemo(() => ({ 1: lastHitOn(rounds, 1), 2: lastHitOn(rounds, 2) }), [rounds])

	return (
		<div
			className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4"
			role="dialog"
			aria-modal="true"
			aria-label={`Battle between ${first.name} and ${second.name}`}
		>
			<div
				className={`${theme === 'light' ? 'bg-amber-50 text-slate-700' : 'bg-slate-800 text-white'} flex h-[min(44rem,100%)] w-full max-w-2xl flex-col gap-4 rounded-2xl p-5 shadow-2xl`}
			>
				<div className="flex shrink-0 items-start justify-center gap-2 sm:gap-6">
					<BattleFighter
						pokemon={first}
						hp={currentHp.first}
						outcome={outcomeOf(1)}
						lastHit={lastHits[1]}
					/>
					<span className="self-center text-xl font-extrabold">VS</span>
					<BattleFighter
						pokemon={second}
						hp={currentHp.second}
						outcome={outcomeOf(2)}
						lastHit={lastHits[2]}
					/>
				</div>

				<div
					ref={logRef}
					className={`${theme === 'light' ? 'bg-white' : 'bg-slate-900'} flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-xl p-3`}
					aria-live="polite"
				>
					{rounds.length === 0 && isStreaming && (
						<span className="animate-pulse">The Pokemon are entering the arena...</span>
					)}

					{rounds.map((round) => {
						const attacker = pokemonOf(round.attacker)
						return (
							<div
								key={round.round}
								className={`${theme === 'light' ? 'bg-amber-100' : 'bg-slate-700'} rounded-lg px-3 py-2`}
							>
								<div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
									<span>
										Round {round.round} · {attacker.name} uses {round.move}
									</span>
									<span className="text-red-500">-{round.damage} HP</span>
								</div>
								<p className="mt-1 text-sm leading-relaxed">{round.text}</p>
							</div>
						)
					})}

					{isStreaming && rounds.length > 0 && !winner && (
						<span className="animate-pulse text-sm">▍</span>
					)}

					{status === 'error' && (
						<span className="font-bold text-red-600">{error ?? 'Something went wrong'}</span>
					)}
				</div>

				{winner && winnerPokemon && (
					<div className="flex shrink-0 animate-pop items-center justify-center gap-4">
						<img
							src={winnerPokemon.image}
							alt={winnerPokemon.name}
							className="h-24 w-24 shrink-0 object-contain drop-shadow-[0_0_16px_rgba(251,191,36,0.9)]"
						/>
						<div className="min-w-0">
							<div className="text-xl font-extrabold">🏆 {winnerPokemon.name} wins!</div>
							<div className="text-sm italic">{winner.reason}</div>
						</div>
					</div>
				)}

				<div className="flex shrink-0 flex-wrap justify-center gap-3">
					{status === 'error' && <Button onClick={() => void start(first, second)}>Retry</Button>}
					{status === 'done' && (
						<Button onClick={() => void start(first, second)}>Fight again</Button>
					)}
					<Button variant="secondary" onClick={onNewBattle} disabled={isStreaming}>
						New battle
					</Button>
					<Button variant="secondary" onClick={onClose}>
						{isStreaming ? 'Stop' : 'Close'}
					</Button>
				</div>
			</div>
		</div>
	)
}

export default BattleArena
