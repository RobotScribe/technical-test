import React from 'react'
import { useTheme } from '../components/theme'
import { cn } from './cn'

export type TextInputProps = React.ComponentPropsWithoutRef<'input'>

export const TextInput: React.FC<TextInputProps> = ({ className, ...props }) => {
	const { theme } = useTheme()

	return (
		<input
			className={cn(
				'w-full rounded-xl px-4 py-2 outline-none border-2 border-amber-300 focus:border-orange-400',
				theme === 'light' ? 'bg-white text-slate-700' : 'bg-slate-700 text-white',
				className,
			)}
			{...props}
		/>
	)
}
