import type { BattleRequest } from '@shared/types/pokemon.types'
import { API_URL } from './config'

const errorMessage = async (response: Response): Promise<string> => {
	try {
		const body = (await response.json()) as { error?: string }
		if (body.error) return body.error
	} catch {
		// The body is not JSON: use the generic message below
	}
	return `The battle could not be generated (${response.status})`
}

/**
 * Ask the LLM to simulate a battle and call `onChunk` with each piece of text as soon as it arrives.
 * `fetch` is used instead of axios because axios cannot read a response stream in the browser.
 */
export const streamBattle = async (
	request: BattleRequest,
	onChunk: (chunk: string) => void,
	signal: AbortSignal,
): Promise<void> => {
	const response = await fetch(`${API_URL}/battles/stream`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(request),
		signal,
	})

	if (!response.ok) {
		throw new Error(await errorMessage(response))
	}
	if (!response.body) {
		throw new Error('The browser does not support streamed responses')
	}

	const reader = response.body.getReader()
	const decoder = new TextDecoder()

	for (;;) {
		const { done, value } = await reader.read()
		if (done) break
		onChunk(decoder.decode(value, { stream: true }))
	}

	const rest = decoder.decode()
	if (rest) onChunk(rest)
}
