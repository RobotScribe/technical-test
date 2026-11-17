import React from 'react'
import { useTheme } from '../components/theme'
import { cn } from './cn'

export interface ChipProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'aria-pressed'> {
	selected?: boolean
}

export const Chip: React.FC<ChipProps> = ({
	selected = false,
	type = 'button',
	className,
	...props
}) => {
	const { theme } = useTheme()

	return (
		<button
			type={type}
			aria-pressed={selected}
			className={cn(
				'rounded-full px-3 py-1 text-sm capitalize border-2',
				selected
					? 'bg-orange-400 border-orange-500 text-white'
					: theme === 'light'
						? 'bg-amber-100 border-amber-300 text-slate-700'
						: 'bg-slate-700 border-slate-600 text-white',
				className,
			)}
			{...props}
		/>
	)
}
