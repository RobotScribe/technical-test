import js from '@eslint/js'
import tseslint from 'typescript-eslint'

import { strictRules } from '../shared/eslint-strict-rules.mjs'

export default tseslint.config(
	{ ignores: ['dist'] },
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ['**/*.ts'],
		languageOptions: {
			ecmaVersion: 2020,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: strictRules,
	},
	{
		files: ['src/app.ts'],
		rules: {
			// Process entrypoint: the listen log is the server's startup message.
			'no-console': 'off',
		},
	},
)
