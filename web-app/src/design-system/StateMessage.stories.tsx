import type { Meta, StoryObj } from '@storybook/react-vite'
import { StateMessage } from './StateMessage'

const meta = {
	title: 'Design System/StateMessage',
	component: StateMessage,
	tags: ['autodocs'],
	args: { children: 'No Pokémon found.' },
} satisfies Meta<typeof StateMessage>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {}
export const Loading: Story = { args: { children: 'Loading…' } }
export const Error: Story = { args: { children: 'Something went wrong.' } }
