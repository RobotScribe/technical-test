import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = {
	title: 'Design System/Button',
	component: Button,
	tags: ['autodocs'],
	args: { children: 'Button' },
	argTypes: {
		variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
		size: { control: 'inline-radio', options: ['sm', 'md'] },
		disabled: { control: 'boolean' },
	},
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { variant: 'primary' } }
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Small: Story = { args: { size: 'sm' } }
export const Disabled: Story = { args: { disabled: true } }

export const AllVariants: Story = {
	render: (args) => (
		<div className="flex flex-col gap-4">
			{(['md', 'sm'] as const).map((size) => (
				<div key={size} className="flex items-center gap-4">
					<Button {...args} variant="primary" size={size}>
						Primary
					</Button>
					<Button {...args} variant="secondary" size={size}>
						Secondary
					</Button>
					<Button {...args} variant="ghost" size={size}>
						Ghost
					</Button>
				</div>
			))}
		</div>
	),
}
