import type { Meta, StoryObj } from '@storybook/react-vite'
import { TextInput } from './TextInput'

const meta = {
	title: 'Design System/TextInput',
	component: TextInput,
	tags: ['autodocs'],
	args: { placeholder: 'Search a Pokémon…' },
	argTypes: { disabled: { control: 'boolean' } },
} satisfies Meta<typeof TextInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithValue: Story = { args: { defaultValue: 'Pikachu' } }
export const Disabled: Story = { args: { disabled: true } }
