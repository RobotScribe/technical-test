import 'dotenv/config'

export const getChatbotToken = (): string => {
	const token = process.env.CHATBOT_API_TOKEN

	if (!token) {
		throw new Error('Missing CHATBOT_API_TOKEN environment variable (see backend/.env.example)')
	}

	return token
}
