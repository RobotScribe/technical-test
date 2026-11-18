import React, { useEffect, useState, ReactNode } from 'react'
import { Theme, ThemeContext } from './theme'

const THEME_STORAGE_KEY = 'theme'

interface ThemeProviderProps {
	children: ReactNode
}

function readStoredTheme(): Theme {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY)
		if (stored === 'light' || stored === 'dark') {
			return stored
		}
	} catch {
		// localStorage can throw when it is blocked or unavailable
	}
	return 'light'
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const [theme, setTheme] = useState<Theme>(readStoredTheme)

	useEffect(() => {
		try {
			localStorage.setItem(THEME_STORAGE_KEY, theme)
		} catch {
			// ignore write failures so the theme still works in memory
		}
	}, [theme])

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
	}

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
