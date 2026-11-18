import type { Readable } from 'stream'
import { streamCompletion } from '../clients/virtualbrain.client'
import { battlePrompt } from '../prompt/battle.prompt'
import { fetchPokemon } from './pokemon.service'

export const startBattleStream = async (
	firstId: number,
	secondId: number,
	signal: AbortSignal,
): Promise<Readable> => {
	const [first, second] = await Promise.all([fetchPokemon(firstId), fetchPokemon(secondId)])

	return streamCompletion(battlePrompt(first, second), signal)
}
