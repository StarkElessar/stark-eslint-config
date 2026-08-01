import js from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

const JAVASCRIPT_FILES = ['**/*.{js,mjs,cjs,jsx}'];
const TYPESCRIPT_FILES = ['**/*.{ts,mts,cts,tsx}'];
const SOURCE_FILES = [...JAVASCRIPT_FILES, ...TYPESCRIPT_FILES];

/**
 * Recommended core ESLint rules for JavaScript, TypeScript, JSX, and TSX.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const base = [
	{
		...js.configs.recommended,
		name: '@stark/eslint-config/base',
		files: SOURCE_FILES,
		languageOptions: {
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
	},
];

/**
 * Syntax-only recommended TypeScript rules, scoped to TypeScript and TSX.
 * Consumers opt into projectService or project paths in their own config.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const typescript = tseslint.configs.recommended.map((config, index) => ({
	...config,
	name: config.name
		? `@stark/eslint-config/${config.name}`
		: `@stark/eslint-config/typescript-${index}`,
	files: TYPESCRIPT_FILES,
}));

/**
 * Shared formatting policy for JavaScript, TypeScript, JSX, and TSX.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const stylistic = [
	{
		name: '@stark/eslint-config/stylistic',
		files: SOURCE_FILES,
		plugins: {
			'@stylistic': stylisticPlugin,
		},
		rules: {
			'@stylistic/brace-style': ['error', 'stroustrup', {
				allowSingleLine: false,
			}],
			'@stylistic/indent': ['error', 'tab', {
				SwitchCase: 1,
			}],
			'@stylistic/jsx-quotes': ['error', 'prefer-single'],
			'@stylistic/jsx-indent-props': ['error', 'tab'],
			'@stylistic/max-len': ['error', {
				code: 140,
				comments: 140,
				tabWidth: 4,
			}],
			'@stylistic/no-trailing-spaces': 'error',
			'@stylistic/quotes': ['error', 'single', {
				avoidEscape: true,
			}],
			'@stylistic/semi': ['error', 'always'],
		},
	},
];

/**
 * Convenient complete preset. Individual fragments remain independently
 * composable and can be omitted or extended by consumers.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const recommended = [
	...base,
	...typescript,
	...stylistic,
];

export default recommended;
