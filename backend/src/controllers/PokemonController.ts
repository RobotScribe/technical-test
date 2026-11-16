import { type Request, type Response, Router } from 'express'
import { fetchPokemon } from '../services/pokeapi'

const PokemonController = Router()

PokemonController.get(
	'/:id',
	async (req: Request, res: Response) => {
		const { id } = req.params

		if(typeof id !== 'string') {
			return res.status(400).send({error: 'Invalid ID'})
		}
		const pokemon = await fetchPokemon(id)

		return res.status(200).send({pokemon})
	}
)

export { PokemonController }
