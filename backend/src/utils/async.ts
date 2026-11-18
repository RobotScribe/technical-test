const isPlainObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Default cache key: a JSON serialization where object keys are sorted, so that `{ a: 1, b: 2 }` and
 * `{ b: 2, a: 1 }` give the same key. Properties set to `undefined` are ignored (as `JSON.stringify` does).
 * Only meant for JSON-like keys (primitives, plain objects, arrays); pass a custom `getCacheKey` otherwise.
 */
export const stableKey = (key: unknown): string =>
	JSON.stringify(key, (_, value: unknown) =>
		isPlainObject(value)
			? Object.fromEntries(Object.entries(value).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
			: value,
	)

/**
 * Memoize an async function by key. The key can be a primitive or an object: keys are compared by content
 * (see `stableKey`), not by reference. Use `getCacheKey` to customize how a key is turned into a cache id.
 * The promise is cached (not the value) so concurrent calls with the same key share a single in-flight request.
 * A rejected promise is evicted so that the next call can retry.
 */
export const memoizeAsync = <K, V>(
	fn: (key: K) => Promise<V>,
	getCacheKey: (key: K) => string = stableKey,
): ((key: K) => Promise<V>) => {
	const cache = new Map<string, Promise<V>>()

	return (key) => {
		const cacheKey = getCacheKey(key)
		const cached = cache.get(cacheKey)
		if (cached) return cached

		const promise = fn(key).catch((error: unknown) => {
			cache.delete(cacheKey)
			throw error
		})
		cache.set(cacheKey, promise)
		return promise
	}
}

/** Same as `memoizeAsync` for a function without argument: it is only executed once (until it fails). */
export const memoizeAsyncOnce = <V>(fn: () => Promise<V>): (() => Promise<V>) => {
	const memoized = memoizeAsync<null, V>(() => fn())
	return () => memoized(null)
}

/**
 * Like `Promise.all(items.map(fn))` but with at most `limit` calls running at the same time.
 * Results keep the order of `items`. On the first error no new item is started and the error is thrown.
 */
export const mapWithConcurrency = async <T, R>(
	items: readonly T[],
	limit: number,
	fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
	const results = new Array<R>(items.length)
	let nextIndex = 0
	let stopped = false

	const worker = async (): Promise<void> => {
		while (!stopped && nextIndex < items.length) {
			const index = nextIndex++
			try {
				results[index] = await fn(items[index] as T, index)
			} catch (error) {
				stopped = true
				throw error
			}
		}
	}

	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
	return results
}
