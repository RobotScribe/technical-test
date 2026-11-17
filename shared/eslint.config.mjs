import js from '@eslint/js'
import tseslint from 'typescript-eslint'

import { strictRules } from './eslint-strict-rules.mjs'

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
)
