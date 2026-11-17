import { useMemo, useState } from 'react'
import { useTheme } from './theme'
import type { Pokemon } from '@shared/types/pokemon.types'

interface CardProps {
	pokemon: Pokemon
}

function throttle<Args extends unknown[]>(
	func: (...args: Args) => unknown,
	delay: number = 100,
): (...args: Args) => void {
	let lastCall = 0
	return (...args: Args) => {
		const now = new Date().getTime()
		if (now - lastCall < delay) {
			return
		}
		lastCall = now
		func(...args)
	}
}

export const MiniCard: React.FC<CardProps> = ({ pokemon }) => {
	return (
		<div className="bg-amber-300 rounded-2xl p-2 h-[40px] flex items-center">
			<img src={pokemon.image} alt={pokemon.name} style={{ height: '100%' }} />
			<div className="text-center ml-2">{pokemon.name}</div>
		</div>
	)
}

interface SelectableCardProps extends CardProps {
	selected?: boolean
	onSelect?: () => void
}

const Card: React.FC<SelectableCardProps> = ({ pokemon, selected = false, onSelect }) => {
	const { theme } = useTheme()

	const [rotate, setRotate] = useState({ x: 0, y: 0 })

	const onMouseMove = useMemo(
		() =>
			throttle((e: React.MouseEvent<HTMLDivElement>) => {
				const card = e.currentTarget
				const box = card.getBoundingClientRect()
				const x = e.clientX - box.left
				const y = e.clientY - box.top
				const centerX = box.width / 2
				const centerY = box.height / 2
				const rotateX = (y - centerY) / 10
				const rotateY = (centerX - x) / 10

				setRotate({ x: rotateX, y: rotateY })
			}),
		[],
	)

	const onMouseLeave = () => {
		setRotate({ x: 0, y: 0 })
	}
	return (
		<div
			className={` bg-gradient-to-r from-amber-300 via-amber-100 to-amber-300  p-1 rounded-2xl w-[250px] shadow-md outline-orange-400 hover:outline-dashed cursor-pointer ${selected ? 'outline-dashed outline-4' : ''}`}
			role="button"
			tabIndex={0}
			aria-pressed={selected}
			onClick={onSelect}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault()
					onSelect?.()
				}
			}}
			onMouseMove={onMouseMove}
			onMouseLeave={onMouseLeave}
			style={{
				transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
				transition: 'all 400ms cubic-bezier(0.03, 0.98, 0.52, 0.99) 0s',
			}}
		>
			<div className={`rounded-2xl bg-gradient-to-br from-black/10 via-white/70 to-black/10 `}>
				<div className="p-4 flex-col rounded-2xl">
					<div className="flex gap-3 items-center justify-between">
						<div className="font-bold truncate min-w-0" title={pokemon.name}>
							{pokemon.name}
						</div>
						<div className="shrink-0 whitespace-nowrap">HP: {pokemon.stats.HP}</div>
						<div className="flex gap-1 shrink-0">
							{pokemon.apiTypes.map((type) => (
								<img key={type.name} src={type.image} alt={type.name} style={{ width: '20px' }} />
							))}
						</div>
					</div>
					<img
						className={`${theme === 'light' ? 'bg-white' : 'bg-blue-950'} outline outline-2 my-3`}
						src={pokemon.image}
						alt={pokemon.name}
						loading="lazy"
						style={{ width: 'auto' }}
					/>
					<div>Attack: {pokemon.stats.attack}</div>
					<div>Defense: {pokemon.stats.defense}</div>
					<div>Speed: {pokemon.stats.speed}</div>
				</div>
			</div>
		</div>
	)
}

export default Card
