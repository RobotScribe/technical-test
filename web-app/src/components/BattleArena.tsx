import React, { useEffect, useRef } from 'react'
import type { Pokemon } from '@shared/types/pokemon.types'
import { MiniCard } from './Card'
import { useTheme } from './theme'
import { Button } from '../design-system'
import { useBattle } from '../hooks/useBattle'

interface BattleArenaProps {
	first: Pokemon
	second: Pokemon
	onClose: () => void
	onNewBattle: () => void
}

const BattleArena: React.FC<BattleArenaProps> = ({ first, second, onClose, onNewBattle }) => {
	const { theme } = useTheme()
	const { status, text, error, start } = useBattle()
	const logRef = useRef<HTMLDivElement>(null)

	// The battle starts as soon as the arena opens
	useEffect(() => {
		void start(first, second)
	}, [start, first, second])

	// Follow the text while it is being streamed
	useEffect(() => {
		logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
	}, [text])

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose()
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [onClose])

	const isStreaming = status === 'streaming'

	return (
		<div
			className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4"
			role="dialog"
			aria-modal="true"
			aria-label={`Battle between ${first.name} and ${second.name}`}
		>
			<div
				className={`${theme === 'light' ? 'bg-amber-50 text-slate-700' : 'bg-slate-800 text-white'} flex max-h-full w-full max-w-2xl flex-col gap-4 rounded-2xl p-5 shadow-2xl`}
			>
				<div className="flex flex-wrap items-center justify-center gap-4 text-slate-700">
					<MiniCard pokemon={first} />
					<span className={`font-bold ${theme === 'light' ? '' : 'text-white'}`}>VS</span>
					<MiniCard pokemon={second} />
				</div>

				<div
					ref={logRef}
					className={`${theme === 'light' ? 'bg-white' : 'bg-slate-900'} min-h-[200px] flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl p-4 leading-relaxed`}
					aria-live="polite"
				>
					{text}
					{isStreaming && (
						<span className="animate-pulse">
							{text ? ' ▍' : 'The Pokemon are entering the arena...'}
						</span>
					)}
					{status === 'error' && (
						<span className="font-bold text-red-600">{error ?? 'Something went wrong'}</span>
					)}
				</div>

				<div className="flex flex-wrap justify-center gap-3">
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
