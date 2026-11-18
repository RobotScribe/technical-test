import axios from 'axios'
import type { Readable } from 'stream'
import type { VirtualBrainTokens } from './virtualbrain.types'
import { getChatbotToken } from '../config/env'

const VIRTUAL_BRAIN_URL = 'https://chatbot-api.getvirtualbrain.com'

const EXPIRATION_MARGIN_MS = 60 * 1000

export class VirtualBrainError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'VirtualBrainError'
	}
}

interface Session {
	accessToken: string
	refreshToken: string
	chatbotId: string
	expiresAt: number
}

// The session is shared by every request: the API key is only exchanged once per hour
let session: Session | undefined
let pendingLogin: Promise<Session> | undefined

const toSession = (tokens: VirtualBrainTokens): Session => ({
	accessToken: tokens.accessToken,
	refreshToken: tokens.refreshToken,
	chatbotId: tokens.chatbotId,
	expiresAt: Date.now() + tokens.expiresIn * 1000 - EXPIRATION_MARGIN_MS,
})

const exchangeApiKey = async (): Promise<Session> => {
	const { data } = await axios.post<VirtualBrainTokens>(
		`${VIRTUAL_BRAIN_URL}/v1/auth/api-key/token`,
		{ apiKey: getChatbotToken() },
	)
	return toSession(data)
}

const refreshSession = async (current: Session): Promise<Session> => {
	const { data } = await axios.post<VirtualBrainTokens>(
		`${VIRTUAL_BRAIN_URL}/v1/auth/api-key/refresh`,
		{ refreshToken: current.refreshToken, chatbotId: current.chatbotId },
	)
	return toSession(data)
}

const login = async (): Promise<Session> => {
	if (session) {
		try {
			return await refreshSession(session)
		} catch {
			// The refresh token may be expired or revoked: start again from the API key
		}
	}
	return exchangeApiKey()
}

const loginAndStore = async (): Promise<Session> => {
	try {
		session = await login()
		return session
	} finally {
		pendingLogin = undefined
	}
}

const getSession = async (): Promise<Session> => {
	if (session && session.expiresAt > Date.now()) {
		return session
	}

	pendingLogin ??= loginAndStore()
	return pendingLogin
}

const isUnauthorized = (error: unknown): boolean =>
	axios.isAxiosError(error) && error.response?.status === 401

const postQuery = async (query: string, signal: AbortSignal): Promise<Readable> => {
	const { accessToken, chatbotId } = await getSession()
	const { data } = await axios.post<Readable>(
		`${VIRTUAL_BRAIN_URL}/v1/open-completion/${chatbotId}/query`,
		{ query },
		{
			headers: { Authorization: `Bearer ${accessToken}` },
			responseType: 'stream',
			signal,
		},
	)
	return data
}

export const streamCompletion = async (query: string, signal: AbortSignal): Promise<Readable> => {
	try {
		try {
			return await postQuery(query, signal)
		} catch (error) {
			if (!isUnauthorized(error)) throw error
			session = undefined
			return await postQuery(query, signal)
		}
	} catch (error) {
		if (!axios.isAxiosError(error)) throw error
		throw new VirtualBrainError(`Virtual Brain request failed: ${error.message}`)
	}
}
