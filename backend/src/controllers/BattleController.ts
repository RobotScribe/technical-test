import { type Request, type Response, Router } from 'express'
import axios from 'axios'
import { pipeline } from 'stream'
import type { BattleRequest } from '@shared/types/pokemon.types'
import { VirtualBrainError } from '../clients/virtualbrain.client'
import { startBattleStream } from '../services/battle.service'

const BattleController = Router()

const isPokemonId = (value: unknown): value is number =>
	Number.isInteger(value) && Number(value) > 0

/**
 * Ask the LLM to simulate a battle between two pokemons. The answer is streamed as NDJSON:
 * one BattleEvent (a round, then the winner) per line.
 * @route POST /battles/stream
 * @group Battles
 * @param {BattleRequest.model} request.body.required - ids of the two pokemons
 * @returns {string} 200 - Chunked application/x-ndjson stream of the battle
 * @returns {object} 400 - Invalid ids
 * @returns {object} 404 - Pokemon not found
 * @returns {object} 502 - The LLM could not be reached
 */
BattleController.post('/stream', async (req: Request, res: Response) => {
	// With Express 5 the body is undefined when the request has none
	const body = req.body as Partial<BattleRequest> | undefined
	const { firstId, secondId } = body ?? {}

	if (!isPokemonId(firstId) || !isPokemonId(secondId)) {
		return res.status(400).send({ error: 'firstId and secondId must be positive integers' })
	}
	if (firstId === secondId) {
		return res.status(400).send({ error: 'A pokemon cannot fight itself' })
	}

	// Stop the request to the LLM when the client leaves before the end of the battle
	const abortController = new AbortController()
	res.on('close', () => {
		if (!res.writableFinished) abortController.abort()
	})

	try {
		const stream = await startBattleStream(firstId, secondId, abortController.signal)

		res.status(200)
		res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8')
		res.setHeader('Cache-Control', 'no-cache')
		res.setHeader('X-Accel-Buffering', 'no')
		res.flushHeaders()

		pipeline(stream, res, (error) => {
			if (error && !abortController.signal.aborted) {
				console.error('Battle stream failed', error)
			}
		})
		return undefined
	} catch (error) {
		if (abortController.signal.aborted) return undefined
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return res.status(404).send({ error: 'Pokemon not found' })
		}
		if (error instanceof VirtualBrainError) {
			console.error(error)
			return res.status(502).send({ error: 'The battle could not be generated' })
		}
		throw error
	}
})

export { BattleController }
