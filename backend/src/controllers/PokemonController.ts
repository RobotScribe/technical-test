import { type Request, type Response, Router } from 'express'
import type { PokemonListResponse, PokemonListParams, PokemonTypesResponse } from '@shared/types/pokemon.types'
import {  getPokemonsList, getTypeNames } from '../services/pokemon.service'

const PokemonController = Router()

const MAX_POKEMON_LIST_LIMIT = 100;

PokemonController.get(
	'/',
	async (req: Request, res: Response<PokemonListResponse | { error: string }>) => {
		const params = req.query as unknown as PokemonListParams; // TODO: use shared contracts library to avoid as unknown as and problems with numbers converted to strings
		const { name, type, page: pageStr, limit: limitStr } = params

		const page = Number(pageStr)
		const limit = Number(limitStr)

		if (!Number.isInteger(page) || page < 1) {
			return res.status(400).send({ error: 'Invalid page' })
		}
		if (!Number.isInteger(limit) || limit < 1 || limit > MAX_POKEMON_LIST_LIMIT) {
			return res.status(400).send({ error: `Invalid limit (1 to ${MAX_POKEMON_LIST_LIMIT})` })
		}
		if (name !== undefined && typeof name !== 'string') {
			return res.status(400).send({ error: 'Invalid name' })
		}

		if (type !== undefined) {
			const typeNames = await getTypeNames()
			if (typeof type !== 'string' || !typeNames.includes(type)) {
				return res.status(400).send({ error: `Invalid type (${typeNames.join(', ')})` })
			}
		}

		const response = await getPokemonsList({ page, limit, name, type })

		return res.status(200).send(response)
	}
)


PokemonController.get(
	'/types',
	async (_req: Request, res: Response<PokemonTypesResponse>) => {
		const types = await getTypeNames()

		return res.status(200).send({ types })
	}
)

export { PokemonController }
