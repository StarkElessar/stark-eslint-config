import assert from 'node:assert/strict';
import test from 'node:test';

import { ESLint } from 'eslint';

import stark, {
	base,
	imports,
	recommended,
	stylistic,
	typeChecked,
	typescript
} from '../src/index.js';

/**
 * @param {string} code
 * @param {string} filePath
 * @param {import('eslint').Linter.Config[]} config
 */
const lint = async (code, filePath, config = recommended) => {
	const eslint = new ESLint({
		overrideConfig: config,
		overrideConfigFile: true
	});

	const [result] = await eslint.lintText(code, {
		filePath
	});

	return result.messages;
};

/**
 * @param {import('eslint').Linter.LintMessage[]} messages
 */
const ruleIds = (messages) => new Set(messages.map((message) => message.ruleId));

test('exports independently composable flat-config fragments', () => {
	assert.equal(stark, recommended);
	assert.ok(base.length > 0);
	assert.ok(imports.length > 0);
	assert.ok(typescript.length > 0);
	assert.ok(stylistic.length > 0);
	assert.ok(typeChecked.length > 0);
});

test('leaves application-specific configuration to consumers', () => {
	for (const config of recommended) {
		assert.equal(config.ignores, undefined);
		assert.equal(config.languageOptions?.globals, undefined);
		assert.equal(config.languageOptions?.parserOptions?.project, undefined);
		assert.equal(config.languageOptions?.parserOptions?.projectService, undefined);
		assert.equal(config.plugins?.react, undefined);
		assert.ok(config.files?.every((pattern) => !pattern.includes('css')));
	}
});

test('base policy is shared with consumers', () => {
	const rules = Object.assign({}, ...base.map((config) => config.rules ?? {}));

	assert.equal(rules['no-extra-boolean-cast'], 'error');
	assert.deepEqual(rules['no-console'], ['warn', { allow: ['warn', 'error'] }]);
	assert.deepEqual(rules['no-inline-comments'], ['error', { ignorePattern: 'eslint-disable' }]);
	assert.equal(rules['no-negated-condition'], 'error');
	assert.equal(rules['no-var'], 'error');
	assert.equal(rules['prefer-const'], 'error');
});

test('import ordering uses alias-independent FSD layer groups', () => {
	const rules = imports[0].rules['simple-import-sort/imports'];
	const groups = rules[1].groups;

	assert.equal(rules[0], 'error');
	assert.ok(groups.some((group) => group.some((pattern) => pattern.includes('shared'))));
	assert.ok(groups.some((group) => group.some((pattern) => pattern.includes('entities'))));
	assert.ok(groups.some((group) => group.some((pattern) => pattern.includes('features'))));
	assert.ok(groups.some((group) => group.some((pattern) => pattern.includes('widgets'))));
	assert.ok(groups.some((group) => group.some((pattern) => pattern.includes('pages|views'))));
	assert.ok(groups.every((group) => group.every((pattern) => !pattern.includes('@scripts'))));
	assert.equal(imports[0].rules['simple-import-sort/exports'], 'error');
});

test('the complete config loads and accepts valid JavaScript', async () => {
	const messages = await lint(
		[
			'export function select(value) {',
			'\tif (value) {',
			"\t\treturn 'selected';",
			'\t}',
			'\telse {',
			"\t\treturn 'empty';",
			'\t}',
			'}'
		].join('\n') + '\n',
		'example.js'
	);

	assert.deepEqual(messages, []);
});

test('stylistic rules enforce the shared formatting policy', async () => {
	await lint(
		[
			'export function select(value) {',
			'    const label = "selected";  ',
			'    if (value) {',
			'        return label',
			'    } else {',
			"        return 'empty';",
			'    }',
			'}',
			`const longLine = '${'x'.repeat(141)}';`
		].join('\n'),
		'format.js',
		[
			...stylistic
		]
	);
	const configuredRuleIds = new Set(
		stylistic.flatMap((config) => Object.keys(config.rules ?? {}))
	);

	for (const ruleId of [
		'@stylistic/array-bracket-spacing',
		'@stylistic/arrow-parens',
		'@stylistic/brace-style',
		'@stylistic/comma-dangle',
		'@stylistic/indent',
		'@stylistic/keyword-spacing',
		'@stylistic/max-len',
		'@stylistic/no-trailing-spaces',
		'@stylistic/object-curly-spacing',
		'@stylistic/quotes',
		'@stylistic/semi'
	]) {
		assert.ok(configuredRuleIds.has(ruleId), `expected ${ruleId} to be enabled`);
	}

	const braceStyleRule = stylistic.find((config) => config.rules?.['@stylistic/brace-style'])
		.rules['@stylistic/brace-style'];
	assert.deepEqual(braceStyleRule, ['error', 'stroustrup', {
		allowSingleLine: false
	}]);
});

test('TypeScript is parsed without consumer project settings', async () => {
	const messages = await lint(
		[
			'export function identity(value: any) {',
			'\tdebugger;',
			'\treturn value;',
			'}'
		].join('\n'),
		'example.ts'
	);

	assert.ok(ruleIds(messages).has('@typescript-eslint/no-explicit-any'));
	assert.ok(ruleIds(messages).has('no-debugger'));
	assert.ok(messages.every((message) => message.fatal !== true));
});

test('TypeScript policy is shared with consumers', () => {
	const rules = Object.assign({}, ...typescript.map((config) => config.rules ?? {}));

	assert.deepEqual(rules['@typescript-eslint/consistent-type-imports'], ['error', {
		prefer: 'type-imports',
		fixStyle: 'separate-type-imports'
	}]);
	assert.equal(rules['@typescript-eslint/no-explicit-any'], 'error');
	assert.deepEqual(rules['@typescript-eslint/no-unused-expressions'], ['error', {
		allowTernary: true,
		allowShortCircuit: true
	}]);
	assert.deepEqual(rules['@typescript-eslint/no-unused-vars'], ['error', {
		argsIgnorePattern: '^_',
		varsIgnorePattern: '^_',
		caughtErrorsIgnorePattern: '^_'
	}]);
});

test('type-aware policy is separately composable', () => {
	const rules = Object.assign({}, ...typeChecked.map((config) => config.rules ?? {}));

	assert.equal(rules['@typescript-eslint/no-non-null-assertion'], 'warn');
	assert.equal(rules['@typescript-eslint/unified-signatures'], 'warn');
	assert.equal(rules['@typescript-eslint/no-invalid-void-type'], 'off');
	assert.equal(rules['@typescript-eslint/no-extraneous-class'], 'off');
	assert.equal(rules['@typescript-eslint/no-dynamic-delete'], 'warn');
	assert.equal(rules['@typescript-eslint/no-useless-constructor'], 'warn');
	assert.equal(rules['@typescript-eslint/no-redundant-type-constituents'], 'error');
	assert.equal(rules['@typescript-eslint/no-unnecessary-type-arguments'], 'error');
	assert.equal(rules['@typescript-eslint/no-unnecessary-condition'], 'error');
	assert.equal(rules['@typescript-eslint/no-for-in-array'], 'error');
	assert.equal(rules['@typescript-eslint/no-base-to-string'], 'error');
	assert.equal(rules['@typescript-eslint/use-unknown-in-catch-callback-variable'], 'error');
	assert.equal(rules['@typescript-eslint/no-deprecated'], 'warn');
	assert.ok(typeChecked.every((config) => config.languageOptions?.parserOptions?.projectService === undefined));
});

test('JSX and TSX use tab indentation', async () => {
	const jsxMessages = await lint(
		[
			'export const View = () => (',
			'    <main>',
			'        <span>Ready</span>',
			'    </main>',
			');'
		].join('\n'),
		'view.jsx',
		[
			...base,
			...stylistic
		]
	);
	const tsxMessages = await lint(
		[
			'export const View = (props: { label: string }) => (',
			'    <main>',
			'        <span>{props.label}</span>',
			'    </main>',
			');'
		].join('\n'),
		'view.tsx',
		[
			...typescript,
			...stylistic
		]
	);

	assert.ok(ruleIds(jsxMessages).has('@stylistic/indent'));
	assert.ok(ruleIds(tsxMessages).has('@stylistic/indent'));
	assert.deepEqual(
		stylistic.find((config) => config.rules?.['@stylistic/jsx-quotes'])
			.rules['@stylistic/jsx-quotes'],
		['error', 'prefer-single']
	);
	assert.ok(jsxMessages.every((message) => message.fatal !== true));
	assert.ok(tsxMessages.every((message) => message.fatal !== true));
});
