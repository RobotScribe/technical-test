/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			keyframes: {
				shimmer: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' },
				},
				typing: {
					'0%': {
						width: '0%',
						visibility: 'hidden',
					},
					'100%': {
						width: '100%',
					},
				},
				hit: {
					'0%, 100%': { transform: 'translateX(0)', filter: 'none' },
					'20%': { transform: 'translateX(-10px)', filter: 'brightness(2) saturate(2)' },
					'40%': { transform: 'translateX(10px)' },
					'60%': { transform: 'translateX(-6px)', filter: 'brightness(1.5)' },
					'80%': { transform: 'translateX(6px)' },
				},
				damage: {
					'0%': { opacity: '1', transform: 'translateY(0) scale(0.8)' },
					'20%': { transform: 'translateY(-10px) scale(1.3)' },
					'100%': { opacity: '0', transform: 'translateY(-50px) scale(1)' },
				},
				pop: {
					'0%': { opacity: '0', transform: 'scale(0.4)' },
					'70%': { opacity: '1', transform: 'scale(1.15)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
			},
			animation: {
				shimmer: 'shimmer 2s infinite',
				typing: 'typing 1s steps(20)',
				hit: 'hit 0.5s ease-in-out',
				damage: 'damage 1s ease-out forwards',
				pop: 'pop 0.6s ease-out',
			},
		},
	},
	plugins: [],
}
