import assert from 'node:assert/strict';
import test from 'node:test';

import { ESLint } from 'eslint';

import stark, {
	base,
	recommended,
	stylistic,
	typescript,
} from '../src/index.js';

/**
 * @param {string} code
 * @param {string} filePath
 * @param {import('eslint').Linter.Config[]} config
 */
const lint = async (code, filePath, config = recommended) => {
	const eslint = new ESLint({
		overrideConfig: config,
		overrideConfigFile: true,
	});

	const [result] = await eslint.lintText(code, {
		filePath,
	});

	return result.messages;
};

/**
 * @param {import('eslint').Linter.LintMessage[]} messages
 */
const ruleIds = messages => new Set(messages.map(message => message.ruleId));

test('exports independently composable flat-config fragments', () => {
	assert.equal(stark, recommended);
	assert.ok(base.length > 0);
	assert.ok(typescript.length > 0);
	assert.ok(stylistic.length > 0);
});

test('leaves application-specific configuration to consumers', () => {
	for (const config of recommended) {
		assert.equal(config.ignores, undefined);
		assert.equal(config.languageOptions?.globals, undefined);
		assert.equal(config.languageOptions?.parserOptions?.project, undefined);
		assert.equal(config.languageOptions?.parserOptions?.projectService, undefined);
		assert.equal(config.plugins?.react, undefined);
		assert.ok(config.files?.every(pattern => !pattern.includes('css')));
	}
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
			'}',
		].join('\n'),
		'example.js',
	);

	assert.deepEqual(messages, []);
});

test('stylistic rules enforce the shared formatting policy', async () => {
	const messages = await lint(
		[
			'export function select(value) {',
			'    const label = "selected";  ',
			'    if (value) {',
			'        return label',
			'    } else {',
			"        return 'empty';",
			'    }',
			'}',
			`const longLine = '${'x'.repeat(141)}';`,
		].join('\n'),
		'format.js',
		[
			...stylistic,
		],
	);
	const actualRuleIds = ruleIds(messages);

	assert.ok(actualRuleIds.has('@stylistic/indent'));
	assert.ok(actualRuleIds.has('@stylistic/quotes'));
	assert.ok(actualRuleIds.has('@stylistic/semi'));
	assert.ok(actualRuleIds.has('@stylistic/brace-style'));
	assert.ok(actualRuleIds.has('@stylistic/no-trailing-spaces'));
	assert.ok(actualRuleIds.has('@stylistic/max-len'));
});

test('TypeScript is parsed without consumer project settings', async () => {
	const messages = await lint(
		[
			'export function identity(value: any) {',
			'\tdebugger;',
			'\treturn value;',
			'}',
		].join('\n'),
		'example.ts',
	);

	assert.ok(ruleIds(messages).has('@typescript-eslint/no-explicit-any'));
	assert.ok(ruleIds(messages).has('no-debugger'));
	assert.ok(messages.every(message => message.fatal !== true));
});

test('JSX and TSX use tab indentation', async () => {
	const jsxMessages = await lint(
		[
			'export const View = () => (',
			'    <main>',
			'        <span>Ready</span>',
			'    </main>',
			');',
		].join('\n'),
		'view.jsx',
		[
			...base,
			...stylistic,
		],
	);
	const tsxMessages = await lint(
		[
			'export const View = (props: { label: string }) => (',
			'    <main>',
			'        <span>{props.label}</span>',
			'    </main>',
			');',
		].join('\n'),
		'view.tsx',
		[
			...typescript,
			...stylistic,
		],
	);

	assert.ok(ruleIds(jsxMessages).has('@stylistic/indent'));
	assert.ok(ruleIds(tsxMessages).has('@stylistic/indent'));
	assert.ok(jsxMessages.every(message => message.fatal !== true));
	assert.ok(tsxMessages.every(message => message.fatal !== true));
});
