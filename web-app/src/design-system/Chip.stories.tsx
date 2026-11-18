import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chip } from './Chip'

const meta = {
	title: 'Design System/Chip',
	component: Chip,
	tags: ['autodocs'],
	args: { children: 'fire', selected: false },
	argTypes: { selected: { control: 'boolean' } },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Selected: Story = { args: { selected: true } }

export const Group: Story = {
	render: (args) => (
		<div className="flex flex-wrap gap-2">
			<Chip {...args} selected>
				fire
			</Chip>
			<Chip {...args}>water</Chip>
			<Chip {...args}>grass</Chip>
			<Chip {...args}>electric</Chip>
		</div>
	),
}
