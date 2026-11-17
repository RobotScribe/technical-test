import React from 'react'
import { cn } from './cn'

export type StateMessageProps = React.ComponentPropsWithoutRef<'div'>

export const StateMessage: React.FC<StateMessageProps> = ({ className, ...props }) => (
	<div className={cn('text-lg text-center w-full py-10', className)} {...props} />
)
