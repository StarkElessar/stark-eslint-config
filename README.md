# @stark/eslint-config

Private, framework-neutral ESLint 9 flat-config fragments for JavaScript,
TypeScript, JSX, and TSX.

The package is intended to be consumed directly from a Git dependency. It is
not published to npm.

## Install

Install the Git dependency together with its ESLint and TypeScript peers:

```sh
npm install --save-dev \
  'git+ssh://git@<git-host>/<owner>/stark-eslint-config.git#<commit-or-tag>' \
  eslint@^9 typescript@^5
```

The equivalent pnpm command is:

```sh
pnpm add --save-dev \
  'git+ssh://git@<git-host>/<owner>/stark-eslint-config.git#<commit-or-tag>' \
  eslint@^9 typescript@^5
```

Pin a commit or tag so that installs are reproducible.

## Use

The default and `recommended` exports combine all fragments:

```js
// eslint.config.js
import stark from '@stark/eslint-config';

export default [
	{
		ignores: ['dist/**'],
	},
	...stark,
];
```

Use the named exports when an application needs to compose the fragments
itself:

```js
// eslint.config.js
import {
	base,
	stylistic,
	typeChecked,
	typescript,
} from '@stark/eslint-config';

export default [
	...base,
	...typescript,
	...stylistic,
	...typeChecked,
];
```

`base` enables the ESLint-recommended rules for all four language families.
`typescript` adds the syntax-only `typescript-eslint` recommended rules for TS
and TSX. `stylistic` applies the shared formatting policy to all four language
families. `typeChecked` contains the shared type-aware TypeScript policy and
must be applied after the consumer configures `projectService` or a project
path. Keep this order so the TypeScript fragment can disable core rules that
its TypeScript-aware equivalents replace.

Applications that enable their own type-aware rules also configure the parser
in their own repository, where the tsconfig location is known:

```js
import stark from '@stark/eslint-config';

export default [
	...stark,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/no-floating-promises': 'error',
		},
	},
];
```

Framework plugins, environment globals, ignores, and application-specific rules
belong in the consumer config. This package deliberately includes no React or
other framework rules, globals, legacy paths, TypeScript project paths, or
CSS/SCSS linting.

## Formatting policy

ESLint Stylistic is the sole owner of JS/TS/JSX/TSX formatting:

- one literal tab per indentation level (`tabWidth: 4` for line-length
  calculation; configure editors to display tabs at width 4);
- single quotes;
- semicolons;
- Stroustrup braces;
- no trailing spaces;
- a maximum line length of 140 columns for code and comments.

## Develop

```sh
npm install
npm run check
```
