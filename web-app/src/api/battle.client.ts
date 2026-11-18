import type { BattleEvent, BattleRequest } from '@shared/types/pokemon.types'
import { z } from 'zod'
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

const sideSchema = z.union([z.literal(1), z.literal(2)])

const battleEventSchema: z.ZodType<BattleEvent> = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('round'),
		round: z.number(),
		attacker: sideSchema,
		move: z.string(),
		damage: z.number(),
		hp1: z.number(),
		hp2: z.number(),
		text: z.string(),
	}),
	z.object({
		type: z.literal('winner'),
		winner: sideSchema,
		reason: z.string(),
	}),
])

/** The LLM may write something else than an event (a sentence, a code fence): such lines are skipped */
const parseLine = (line: string): BattleEvent | null => {
	const trimmed = line.trim()
	if (!trimmed.startsWith('{')) return null
	try {
		const result = battleEventSchema.safeParse(JSON.parse(trimmed))
		return result.success ? result.data : null
	} catch {
		return null
	}
}

/**
 * Ask the LLM to simulate a battle and call `onEvent` with each event as soon as its line is complete.
 * `fetch` is used instead of axios because axios cannot read a response stream in the browser.
 */
export const streamBattle = async (
	request: BattleRequest,
	onEvent: (event: BattleEvent) => void,
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
	// A chunk can end in the middle of a line: the incomplete end waits for the next chunk
	let buffer = ''

	const flushLines = (lines: string[]) => {
		for (const line of lines) {
			const event = parseLine(line)
			if (event) onEvent(event)
		}
	}

	for (;;) {
		const { done, value } = await reader.read()
		if (done) break
		buffer += decoder.decode(value, { stream: true })
		const lines = buffer.split('\n')
		buffer = lines.pop() ?? ''
		flushLines(lines)
	}

	buffer += decoder.decode()
	flushLines([buffer])
}
