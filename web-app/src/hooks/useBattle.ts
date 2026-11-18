import { useCallback, useEffect, useRef, useState } from 'react'
import type {
	BattleEvent,
	BattleRoundEvent,
	BattleWinnerEvent,
	Pokemon,
} from '@shared/types/pokemon.types'
import { streamBattle } from '../api/battle.client'

export type BattleStatus = 'idle' | 'streaming' | 'done' | 'error'

export interface BattleHp {
	first: number
	second: number
}

const clampHp = (hp: number, max: number): number => Math.min(Math.max(Math.round(hp), 0), max)

export const useBattle = () => {
	const [status, setStatus] = useState<BattleStatus>('idle')
	const [rounds, setRounds] = useState<BattleRoundEvent[]>([])
	const [winner, setWinner] = useState<BattleWinnerEvent | null>(null)
	const [hp, setHp] = useState<BattleHp>({ first: 0, second: 0 })
	const [error, setError] = useState<string | null>(null)
	const abortRef = useRef<AbortController | null>(null)

	const cancel = useCallback(() => {
		abortRef.current?.abort()
		abortRef.current = null
	}, [])

	const reset = useCallback(() => {
		cancel()
		setStatus('idle')
		setRounds([])
		setWinner(null)
		setHp({ first: 0, second: 0 })
		setError(null)
	}, [cancel])

	const start = useCallback(
		async (first: Pokemon, second: Pokemon) => {
			cancel()
			const controller = new AbortController()
			abortRef.current = controller

			const maxHp = { first: first.stats.HP, second: second.stats.HP }
			const seen = { rounds: 0, winner: false, hp: maxHp }

			setStatus('streaming')
			setRounds([])
			setWinner(null)
			setHp(maxHp)
			setError(null)

			const onEvent = (event: BattleEvent) => {
				if (event.type === 'round') {
					// Nothing can happen once a pokemon is knocked out
					if (seen.hp.first === 0 || seen.hp.second === 0) return

					// The hp1/hp2 values written by the LLM are not reliable (they can go up or not match the
					// damage): the HP is computed from the damage, which is the source of truth
					const defender: keyof BattleHp = event.attacker === 1 ? 'second' : 'first'
					const damage = clampHp(event.damage, seen.hp[defender])
					seen.hp = { ...seen.hp, [defender]: seen.hp[defender] - damage }
					seen.rounds += 1

					const round: BattleRoundEvent = {
						...event,
						damage,
						hp1: seen.hp.first,
						hp2: seen.hp.second,
					}
					setRounds((current) => [...current, round])
					setHp(seen.hp)
				} else {
					seen.winner = true
					setWinner(event)
				}
			}

			try {
				await streamBattle({ firstId: first.id, secondId: second.id }, onEvent, controller.signal)
				if (!seen.winner && (seen.hp.first === 0) !== (seen.hp.second === 0)) {
					// The battle is over (one pokemon has no HP left) but the LLM forgot the winner line
					const side = seen.hp.first === 0 ? 2 : 1
					seen.winner = true
					setWinner({
						type: 'winner',
						winner: side,
						reason: `${(side === 1 ? first : second).name} is the last one standing.`,
					})
				}
				if (!seen.winner) {
					// The LLM did not follow the output format, or the stream was cut
					throw new Error(
						seen.rounds > 0
							? 'The battle ended without a winner'
							: 'The battle could not be understood',
					)
				}
				setStatus('done')
			} catch (e) {
				// An aborted battle (closed arena, new battle) is not an error
				if (controller.signal.aborted) return
				setError(e instanceof Error ? e.message : 'The battle could not be generated')
				setStatus('error')
			}
		},
		[cancel],
	)

	// Stop the stream when the component using the hook is unmounted
	useEffect(() => cancel, [cancel])

	return { status, rounds, winner, hp, error, start, cancel, reset }
}
