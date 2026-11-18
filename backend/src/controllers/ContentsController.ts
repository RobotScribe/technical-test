import { type Request, type Response, Router } from 'express'
import axios from 'axios'
import {
	markdownFileName,
	pokemonToMarkdown,
	startExportAllPokemonsAsMarkdown,
} from '../services/contents.service'
import { fetchPokemon } from '../services/pokemon.service'

const ContentController = Router()

/**
 * Start saving all pokemon as markdown in the pokemons-ru folder (repository root).
 * The export runs in the background.
 * @route POST /contents/all
 * @group Contents
 * @returns {object} 202 - Export started
 * @returns {object} 409 - An export is already running
 */
ContentController.post('/all', (_req: Request, res: Response) => {
	const { started, status } = startExportAllPokemonsAsMarkdown()

	return res.status(started ? 202 : 409).send(status)
})

/**
 * Return a pokemon as markdown
 * @route GET /contents/:pokemonId
 * @group Contents
 * @param {string} pokemonId.path.required - Pokemon ID
 */
ContentController.get('/:pokemonId', async (req: Request, res: Response) => {
	const { pokemonId } = req.params

	if (typeof pokemonId !== 'string') {
		return res.status(400).send({ error: 'Invalid ID' })
	}

	try {
		const pokemon = await fetchPokemon(pokemonId)

		res.attachment(markdownFileName(pokemon))
		res.type('text/markdown')

		return res.status(200).send(pokemonToMarkdown(pokemon))
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			return res.status(404).send({ error: 'Pokemon not found' })
		}
		throw error
	}
})

export { ContentController }
