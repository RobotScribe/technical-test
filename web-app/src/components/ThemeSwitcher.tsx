import React from 'react'
import { useTheme } from './theme'
import { IoIosSunny } from 'react-icons/io'
import { IoIosMoon } from 'react-icons/io'
import { Button } from '../design-system'

const ThemeSwitcher: React.FC = () => {
	const { theme, toggleTheme } = useTheme()

	return (
		<Button variant="ghost" onClick={toggleTheme} className="max-w-fit gap-1">
			{theme === 'light' ? <IoIosMoon /> : <IoIosSunny />} {theme === 'light' ? 'dm' : 'lm'}
		</Button>
	)
}

export default ThemeSwitcher
