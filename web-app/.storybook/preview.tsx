import type { Decorator, Preview } from '@storybook/react-vite'
import { ThemeContext, type Theme } from '../src/components/theme'
import '../src/index.css'

const withTheme: Decorator = (Story, context) => {
	const theme = context.globals['theme'] as Theme

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme: () => undefined }}>
			<div
				className={`${theme === 'light' ? 'bg-amber-50 text-slate-700' : 'bg-slate-800 text-white'} min-h-screen p-6`}
			>
				<Story />
			</div>
		</ThemeContext.Provider>
	)
}

const preview: Preview = {
	decorators: [withTheme],
	globalTypes: {
		theme: {
			description: 'App theme',
			toolbar: {
				title: 'Theme',
				icon: 'circlehollow',
				items: [
					{ value: 'light', title: 'Light' },
					{ value: 'dark', title: 'Dark' },
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: { theme: 'light' },
	parameters: {
		layout: 'fullscreen',
	},
}

export default preview
