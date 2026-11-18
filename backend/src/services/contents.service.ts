import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import type { PokemonWithDetails } from '@shared/types/pokemon.types'
import { mapWithConcurrency } from '../utils/async'
import { fetchPokemon, getAllPokemonIds } from './pokemon.service'

const EXPORT_DIR = path.resolve(__dirname, '..', '..', '..', 'pokemons-ru')

const titleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)

export const markdownFileName = (pokemon: PokemonWithDetails): string =>
	`${pokemon.id}-${pokemon.slug}.md`

export const pokemonToMarkdown = (pokemon: PokemonWithDetails): string => {
	const { stats } = pokemon

	return [
		`# ${titleCase(pokemon.name)}`,
		'',
		`- **Pokedex id**: ${pokemon.pokedexId}`,
		`- **Generation**: ${pokemon.apiGeneration}`,
		`- **Types**: ${pokemon.apiTypes.map((type) => type.name).join(', ')}`,
		`- **Main ability**: ${pokemon.resistanceModifyingAbilitiesForApi.name || 'none'}`,
		`- **Pre-evolution**: ${pokemon.apiPreEvolution}`,
		`- **Evolutions**: ${pokemon.apiEvolutions.map((evolution) => evolution.name).join(', ') || 'none'}`,
		`- **Image**: ${pokemon.image}`,
		'',
		'## Base stats',
		'',
		'| Stat | Value |',
		'| --- | --- |',
		`| HP | ${stats.HP} |`,
		`| Attack | ${stats.attack} |`,
		`| Defense | ${stats.defense} |`,
		`| Special attack | ${stats.special_attack} |`,
		`| Special defense | ${stats.special_defense} |`,
		`| Speed | ${stats.speed} |`,
		'',
		'## Resistances',
		'',
		'| Attacking type | Damage multiplier | Relation |',
		'| --- | --- | --- |',
		...pokemon.apiResistances.map(
			(r) => `| ${r.name} | x${r.damage_multiplier} | ${r.damage_relation} |`,
		),
		'',
	].join('\n')
}

export type ExportStatus = {
	status: 'idle' | 'running' | 'done' | 'failed'
	total: number
	done: number
	error?: string
}

const EXPORT_CONCURRENCY = 20

// Only one export can run at a time, its state is kept in memory
let currentExport: ExportStatus = { status: 'idle', total: 0, done: 0 }

const runExport = async (job: ExportStatus): Promise<void> => {
	try {
		const ids = await getAllPokemonIds()
		job.total = ids.length

		await mkdir(EXPORT_DIR, { recursive: true })
		await mapWithConcurrency(ids, EXPORT_CONCURRENCY, async (id) => {
			const pokemon = await fetchPokemon(id)
			await writeFile(path.join(EXPORT_DIR, markdownFileName(pokemon)), pokemonToMarkdown(pokemon))
			job.done += 1
		})
		job.status = 'done'
	} catch (error: unknown) {
		console.error('Markdown export failed', error)
		job.status = 'failed'
		job.error = error instanceof Error ? error.message : String(error)
	}
}

/**
 * Start the export of every pokemon in the background.
 * Returns `false` (and does nothing) if an export is already running.
 */
export const startExportAllPokemonsAsMarkdown = (): {
	status: ExportStatus
	started: boolean
} => {
	if (currentExport.status === 'running') return { status: currentExport, started: false }

	const job: ExportStatus = { status: 'running', total: 0, done: 0 }
	currentExport = job

	// Fire and forget: runExport handles its own errors and never rejects
	void runExport(job)

	return { status: currentExport, started: true }
}
