import js from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
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
					jsx: true
				}
			}
		}
	},
	{
		name: '@stark/eslint-config/base-policy',
		files: SOURCE_FILES,
		rules: {
			'no-extra-boolean-cast': 'error',
			'no-inline-comments': ['error', { ignorePattern: 'eslint-disable' }],
			'no-negated-condition': 'error',
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'no-var': 'error',
			'prefer-const': 'error'
		}
	}
];

/**
 * Syntax-only recommended TypeScript rules, scoped to TypeScript and TSX.
 * Consumers opt into projectService or project paths in their own config.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const typescript = [
	...tseslint.configs.recommended.map((config, index) => ({
		...config,
		name: config.name
			? `@stark/eslint-config/${config.name}`
			: `@stark/eslint-config/typescript-${index}`,
		files: TYPESCRIPT_FILES
	})),
	{
		name: '@stark/eslint-config/typescript-policy',
		files: TYPESCRIPT_FILES,
		rules: {
			'@typescript-eslint/consistent-type-imports': ['error', {
				prefer: 'type-imports',
				fixStyle: 'separate-type-imports'
			}],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-unused-expressions': ['error', {
				allowTernary: true,
				allowShortCircuit: true
			}],
			'@typescript-eslint/no-unused-vars': ['error', {
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_'
			}]
		}
	}
];

/**
 * Type-aware TypeScript policy rules. Consumers must configure the parser's
 * project service or project path before applying this fragment.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const typeChecked = [
	{
		name: '@stark/eslint-config/typescript-type-checked-policy',
		files: TYPESCRIPT_FILES,
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/unified-signatures': 'warn',
			'@typescript-eslint/no-invalid-void-type': 'off',
			'@typescript-eslint/no-extraneous-class': 'off',
			'@typescript-eslint/no-dynamic-delete': 'warn',
			'@typescript-eslint/no-useless-constructor': 'warn',
			'@typescript-eslint/no-redundant-type-constituents': 'error',
			'@typescript-eslint/no-unnecessary-type-arguments': 'error',
			'@typescript-eslint/no-unnecessary-condition': 'error',
			'@typescript-eslint/no-for-in-array': 'error',
			'@typescript-eslint/no-base-to-string': 'error',
			'@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',
			'@typescript-eslint/no-deprecated': 'warn'
		}
	}
];

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
			'@stylistic': stylisticPlugin
		},
		rules: {
			'curly': ['error', 'all'],
			'@stylistic/array-bracket-spacing': ['error', 'never'],
			'@stylistic/arrow-parens': ['error', 'always'],
			'@stylistic/arrow-spacing': ['error', {
				before: true,
				after: true
			}],
			'@stylistic/brace-style': ['error', 'stroustrup', {
				allowSingleLine: false
			}],
			'@stylistic/comma-dangle': ['error', 'never'],
			'@stylistic/comma-spacing': ['error', {
				before: false,
				after: true
			}],
			'@stylistic/computed-property-spacing': ['error', 'never'],
			'@stylistic/eol-last': ['error', 'always'],
			'@stylistic/indent': ['error', 'tab', {
				SwitchCase: 1
			}],
			'@stylistic/jsx-quotes': ['error', 'prefer-single'],
			'@stylistic/jsx-closing-bracket-location': ['error', 'line-aligned'],
			'@stylistic/jsx-first-prop-new-line': ['error', 'multiline'],
			'@stylistic/jsx-indent-props': ['error', 'tab'],
			'@stylistic/jsx-max-props-per-line': ['error', {
				maximum: 1,
				when: 'multiline'
			}],
			'@stylistic/jsx-tag-spacing': ['error', {
				beforeSelfClosing: 'never',
				afterOpening: 'never',
				beforeClosing: 'never'
			}],
			'@stylistic/jsx-wrap-multilines': ['error', {
				declaration: 'parens-new-line',
				assignment: 'parens-new-line',
				return: 'parens-new-line',
				arrow: 'parens-new-line',
				condition: 'parens-new-line',
				logical: 'parens-new-line',
				prop: 'parens-new-line'
			}],
			'@stylistic/keyword-spacing': ['error', {
				before: true,
				after: true
			}],
			'@stylistic/max-len': ['error', {
				code: 140,
				comments: 140,
				tabWidth: 4
			}],
			'@stylistic/member-delimiter-style': ['error', {
				multiline: {
					delimiter: 'semi',
					requireLast: true
				},
				singleline: {
					delimiter: 'semi',
					requireLast: false
				}
			}],
			'@stylistic/no-extra-semi': 'error',
			'@stylistic/no-multiple-empty-lines': ['error', {
				max: 1,
				maxBOF: 0,
				maxEOF: 1
			}],
			'@stylistic/no-multi-spaces': 'error',
			'@stylistic/no-trailing-spaces': 'error',
			'@stylistic/object-curly-newline': ['error', {
				ImportDeclaration: {
					multiline: true,
					consistent: true
				},
				ExportDeclaration: {
					multiline: true,
					consistent: true
				},
				ObjectExpression: {
					multiline: true,
					consistent: true
				},
				ObjectPattern: {
					multiline: true,
					consistent: true
				}
			}],
			'@stylistic/object-curly-spacing': ['error', 'always'],
			'@stylistic/padded-blocks': ['error', 'never'],
			'@stylistic/quotes': ['error', 'single', {
				avoidEscape: true
			}],
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/semi-spacing': ['error', {
				before: false,
				after: true
			}],
			'@stylistic/space-before-blocks': ['error', 'always'],
			'@stylistic/space-before-function-paren': ['error', {
				anonymous: 'always',
				named: 'never',
				asyncArrow: 'always'
			}],
			'@stylistic/space-in-parens': ['error', 'never'],
			'@stylistic/space-infix-ops': 'error',
			'@stylistic/type-annotation-spacing': 'error'
		}
	}
];

/**
 * Shared import ordering for TypeScript and TSX. FSD layer groups support
 * conventional alias prefixes without binding the package to one alias.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const imports = [
	{
		name: '@stark/eslint-config/imports',
		files: TYPESCRIPT_FILES,
		plugins: {
			'simple-import-sort': simpleImportSort
		},
		rules: {
			'simple-import-sort/imports': ['error', {
				groups: [
					['^.+\\.s?css(\\?.*)?$'],
					['^\\u0000'],
					['^node:'],
					['^(?:~|@|#)/(?:shared)(?:/|$)'],
					['^(?:~|@|#)/(?:entities)(?:/|$)'],
					['^(?:~|@|#)/(?:features)(?:/|$)'],
					['^(?:~|@|#)/(?:widgets)(?:/|$)'],
					['^(?:~|@|#)/(?:pages|views)(?:/|$)'],
					['^(?:~|@|#)/'],
					['^@?\\w'],
					['^\\.\\.(?!/?$)', '^\\.\\./?$'],
					['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$']
				]
			}],
			'simple-import-sort/exports': 'error'
		}
	}
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
	...imports
];

export default recommended;
