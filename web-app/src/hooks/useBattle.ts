import { useCallback, useEffect, useRef, useState } from 'react'
import type { Pokemon } from '@shared/types/pokemon.types'
import { streamBattle } from '../api/battle.client'

export type BattleStatus = 'idle' | 'streaming' | 'done' | 'error'

export const useBattle = () => {
	const [status, setStatus] = useState<BattleStatus>('idle')
	const [text, setText] = useState('')
	const [error, setError] = useState<string | null>(null)
	const abortRef = useRef<AbortController | null>(null)

	const cancel = useCallback(() => {
		abortRef.current?.abort()
		abortRef.current = null
	}, [])

	const reset = useCallback(() => {
		cancel()
		setStatus('idle')
		setText('')
		setError(null)
	}, [cancel])

	const start = useCallback(
		async (first: Pokemon, second: Pokemon) => {
			cancel()
			const controller = new AbortController()
			abortRef.current = controller

			setStatus('streaming')
			setText('')
			setError(null)

			try {
				await streamBattle(
					{ firstId: first.id, secondId: second.id },
					(chunk) => setText((current) => current + chunk),
					controller.signal,
				)
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

	return { status, text, error, start, cancel, reset }
}
