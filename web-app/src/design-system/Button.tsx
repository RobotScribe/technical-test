import React from 'react'
import { cn } from './cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
	variant?: ButtonVariant
	size?: ButtonSize
}

const base =
	'inline-flex items-center justify-center rounded-full transition-opacity disabled:opacity-40 disabled:cursor-not-allowed'

const variants: Record<ButtonVariant, string> = {
	primary: 'bg-amber-300 text-slate-700',
	secondary: 'border-2 border-amber-300 bg-amber-100 text-slate-700',
	ghost: 'bg-transparent',
}

const sizes: Record<ButtonSize, string> = {
	sm: 'px-3 py-1 text-sm',
	md: 'px-4 py-2',
}

export const Button: React.FC<ButtonProps> = ({
	variant = 'primary',
	size = 'md',
	type = 'button',
	className,
	...props
}) => (
	<button
		type={type}
		className={cn(base, variants[variant], variant !== 'ghost' && sizes[size], className)}
		{...props}
	/>
)
