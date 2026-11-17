// Shared strictness rules for web, api and this package.
// Plugins that are not installed are listed in the root README.
export const strictRules = {
	'no-unused-vars': 'off',
	'no-console': ['error', { allow: ['warn', 'error', 'debug'] }],
	eqeqeq: ['error'],
	complexity: ['error', 20],
	'max-lines': ['error', { max: 300, skipComments: true }],
	'max-depth': ['error', 3],
	'max-params': ['error', 4],
	'@typescript-eslint/no-shadow': 'error',
	'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
	'@typescript-eslint/no-unnecessary-condition': 'error',
	'@typescript-eslint/no-unnecessary-type-arguments': 'error',
	'@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
	'@typescript-eslint/no-unnecessary-type-assertion': 'error',
	'@typescript-eslint/no-unnecessary-type-constraint': 'error',
	'@typescript-eslint/no-floating-promises': 'error',
	'@typescript-eslint/only-throw-error': ['error', { allow: [{ from: 'lib', name: 'never' }] }],
	'@typescript-eslint/restrict-template-expressions': [
		'error',
		{
			allowNumber: true,
			allowBoolean: true,
			allowNullish: false,
		},
	],
}
