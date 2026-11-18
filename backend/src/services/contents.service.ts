import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import type { DamageRelation, PokemonWithDetails, Resistance } from '@shared/types/pokemon.types'
import { mapWithConcurrency } from '../utils/async'
import { fetchPokemon, getAllPokemonIds } from './pokemon.service'

const EXPORT_DIR = path.resolve(__dirname, '..', '..', '..', 'pokemons-ru')

const titleCase = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)

export const markdownFileName = (pokemon: PokemonWithDetails): string =>
	`${pokemon.id}-${pokemon.slug}.md`

const joinNames = (names: string[]): string => {
	const head = names.slice(0, -1)
	const last = names.slice(-1).join('')
	return head.length > 0 ? `${head.join(', ')} and ${last}` : last
}

// The pokemon name is repeated in every sentence on purpose: the files are split in chunks for
// the RAG, and each chunk must still mention the pokemon to be found when searching by name.
const resistanceLines = (name: string, resistances: Resistance[]): string[] => {
	const namesWhere = (...relations: DamageRelation[]): string[] =>
		resistances.filter((r) => relations.includes(r.damage_relation)).map((r) => r.name)

	const groups: { label: string; types: string[] }[] = [
		{ label: 'is immune (x0) to', types: namesWhere('immune') },
		{ label: 'is twice resistant (x0.25) to', types: namesWhere('twice_resistant') },
		{ label: 'resists (x0.5)', types: namesWhere('resistant') },
		{ label: 'is vulnerable (x2) to', types: namesWhere('vulnerable') },
		{ label: 'is twice vulnerable (x4) to', types: namesWhere('twice_vulnerable') },
	]

	const lines = groups
		.filter(({ types }) => types.length > 0)
		.map(({ label, types }) => `${name} ${label} ${joinNames(types)} attacks.`)

	return [...lines, `${name} takes normal damage (x1) from all other types.`]
}

export const pokemonToMarkdown = (pokemon: PokemonWithDetails): string => {
	const { stats } = pokemon
	const name = titleCase(pokemon.name)
	const types = pokemon.apiTypes.map((type) => type.name)
	const evolutions = pokemon.apiEvolutions.map((evolution) => titleCase(evolution.name))
	const ability = pokemon.resistanceModifyingAbilitiesForApi.name

	const description = [
		`${name} is a ${types.join('/')} type Pokemon from generation ${pokemon.apiGeneration}.`,
		ability ? `Its main ability is ${ability}.` : '',
		pokemon.apiPreEvolution !== 'none'
			? `${name} evolves from ${titleCase(pokemon.apiPreEvolution)}.`
			: `${name} has no pre-evolution.`,
		evolutions.length > 0
			? `${name} evolves into ${joinNames(evolutions)}.`
			: `${name} has no evolution.`,
	]
		.filter(Boolean)
		.join(' ')

	return [
		`# ${name} (Pokedex #${pokemon.pokedexId})`,
		'',
		description,
		'',
		`## ${name} base stats`,
		'',
		`${name} base stats: HP ${stats.HP}, Attack ${stats.attack}, Defense ${stats.defense}, Special attack ${stats.special_attack}, Special defense ${stats.special_defense}, Speed ${stats.speed}.`,
		'',
		`## ${name} type resistances and weaknesses`,
		'',
		...resistanceLines(name, pokemon.apiResistances),
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
