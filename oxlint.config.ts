import { defineConfig } from 'oxlint';

/**
 * Strict lint policy for this repository.
 *
 * Every category except `nursery`, `style` and `restriction` is an error. Rules from those three
 * are opted into one by one below. Rules that are off are listed with the reason, so
 * re-enabling one is a deliberate choice.
 *
 * The plugin dogfoods itself: its rules are loaded straight from `src` under the `gnkz/` prefix.
 */
export default defineConfig({
	plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'import', 'promise', 'node', 'vitest'],
	jsPlugins: [{ name: 'gnkz', specifier: './src/index.ts' }],
	options: {
		typeAware: true,
		denyWarnings: true,
		reportUnusedDisableDirectives: 'error',
	},
	categories: {
		correctness: 'error',
		suspicious: 'error',
		pedantic: 'error',
		perf: 'error',
	},
	ignorePatterns: ['**/dist/**', '**/coverage/**'],
	rules: {
		// ── Weak typing & type escape hatches ────────────────────────────────────────────────────
		// `value as Foo` and `<Foo>value` are banned outright. `as const` and `satisfies` stay legal.
		'typescript/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
		'typescript/no-explicit-any': ['error', { fixToUnknown: false, ignoreRestArgs: false }],
		'typescript/no-non-null-assertion': 'error',
		'typescript/no-unsafe-type-assertion': 'error',
		'typescript/ban-ts-comment': [
			'error',
			{
				'ts-check': true,
				'ts-expect-error': true,
				'ts-ignore': true,
				'ts-nocheck': true,
			},
		],
		'typescript/no-empty-object-type': 'error',
		'typescript/no-restricted-types': [
			'error',
			{
				types: {
					Object: { message: 'Use a concrete object type.' },
					Function: { message: 'Use an explicit function signature.' },
					object: { message: 'Use a concrete object type.' },
				},
			},
		],
		'typescript/no-invalid-void-type': 'error',
		'typescript/no-unnecessary-condition': 'error',
		'typescript/prefer-optional-chain': 'error',
		'typescript/switch-exhaustiveness-check': [
			'error',
			{ considerDefaultExhaustiveForUnions: false, requireDefaultForNonUnion: true },
		],
		'typescript/explicit-module-boundary-types': 'error',
		'typescript/restrict-plus-operands': [
			'error',
			{
				allowAny: false,
				allowBoolean: false,
				allowNullish: false,
				allowNumberAndString: false,
				allowRegExp: false,
				skipCompoundAssignments: false,
			},
		],
		'typescript/restrict-template-expressions': [
			'error',
			{
				allowAny: false,
				allowBoolean: false,
				allowNever: false,
				allowNullish: false,
				allowRegExp: false,
				allowNumber: true,
			},
		],
		'typescript/use-unknown-in-catch-callback-variable': 'error',
		'typescript/no-dynamic-delete': 'error',
		'typescript/no-unnecessary-type-arguments': 'error',
		'typescript/no-unnecessary-type-parameters': 'error',
		'typescript/no-unnecessary-type-assertion': 'error',
		'typescript/no-unnecessary-type-conversion': 'error',
		'typescript/no-unnecessary-boolean-literal-compare': 'error',
		'typescript/no-unnecessary-template-expression': 'error',
		'typescript/no-unsafe-enum-comparison': 'error',
		'typescript/prefer-reduce-type-parameter': 'error',
		'typescript/prefer-as-const': 'error',
		'typescript/no-inferrable-types': 'error',
		'typescript/array-type': ['error', { default: 'array-simple', readonly: 'array-simple' }],
		'typescript/consistent-type-imports': 'error',
		'typescript/consistent-type-exports': 'error',
		'typescript/no-import-type-side-effects': 'error',
		'typescript/consistent-return': 'error',
		'typescript/dot-notation': 'off', // conflicts with tsconfig `noPropertyAccessFromIndexSignature`
		'typescript/prefer-readonly': 'error',
		// Wants every parameter to be deeply readonly. Too noisy with third-party types.
		'typescript/prefer-readonly-parameter-types': 'off',
		// Allows `foo as Bar` instead of `foo!`; both are banned above.
		'typescript/non-nullable-type-assertion-style': 'off',
		'typescript/no-namespace': 'error',
		'typescript/no-require-imports': 'error',
		'typescript/no-extraneous-class': 'error',
		'typescript/prefer-for-of': 'error',
		'typescript/prefer-function-type': 'error',
		'typescript/unified-signatures': 'error',
		'typescript/promise-function-async': 'error',

		// ── Errors & async ───────────────────────────────────────────────────────────────────────
		'no-void': ['error', { allowAsStatement: false }], // `void promise` must not silence floating promises
		'preserve-caught-error': ['error', { requireCatchParameter: true }],
		'no-empty': ['error', { allowEmptyCatch: false }],
		'no-throw-literal': 'error',
		'unicorn/error-message': 'error',
		'unicorn/throw-new-error': 'error',
		'unicorn/prefer-type-error': 'error',
		'unicorn/custom-error-definition': 'error',
		'promise/prefer-await-to-then': 'error',
		'promise/prefer-await-to-callbacks': 'error',
		'promise/no-nesting': 'error',
		'promise/no-return-wrap': 'error',
		'promise/param-names': 'error',
		'promise/no-multiple-resolved': 'error',
		'promise/no-promise-in-callback': 'error',

		// ── Complexity ───────────────────────────────────────────────────────────────────────────
		complexity: ['error', { max: 10 }],
		'max-depth': ['error', { max: 3 }],
		'max-nested-callbacks': ['error', { max: 3 }],
		'max-params': ['error', { max: 3 }],
		'max-statements': ['error', { max: 20 }],
		'max-lines-per-function': ['error', { max: 60, skipBlankLines: true, skipComments: true, IIFEs: true }],
		'max-lines': ['error', { max: 400, skipBlankLines: true, skipComments: true }],
		'max-classes-per-file': ['error', { max: 1 }],
		'import/max-dependencies': ['error', { max: 15, ignoreTypeImports: true }],
		'no-nested-ternary': 'error',
		'unicorn/no-nested-ternary': 'off', // duplicate of eslint/no-nested-ternary
		'unicorn/no-negated-condition': 'off', // duplicate of eslint/no-negated-condition
		'unicorn/no-lonely-if': 'off', // duplicate of eslint/no-lonely-if
		'no-else-return': ['error', { allowElseIf: false }],
		'unicorn/max-nested-calls': 'error',

		// ── Low-signal code that agents tend to write ────────────────────────────────────────────
		'no-console': 'error',
		'no-warning-comments': ['error', { terms: ['todo', 'fixme', 'xxx', 'hack'] }],
		'no-magic-numbers': [
			'error',
			{
				ignore: [-1, 0, 1, 2],
				ignoreArrayIndexes: true,
				ignoreDefaultValues: true,
				ignoreClassFieldInitialValues: true,
				ignoreEnums: true,
				ignoreNumericLiteralTypes: true,
				ignoreReadonlyClassProperties: true,
				ignoreTypeIndexes: true,
				enforceConst: true,
			},
		],
		'no-unused-vars': [
			'error',
			{
				// An `_` prefix does not exempt a binding. Delete unused code instead.
				args: 'after-used',
				caughtErrors: 'all',
				ignoreRestSiblings: true,
				reportUsedIgnorePattern: true,
			},
		],
		'no-param-reassign': ['error', { props: true }],
		'no-shadow': 'error',
		eqeqeq: ['error', 'always'],
		curly: ['error', 'all'],
		'prefer-const': 'error',
		'no-var': 'error',
		'object-shorthand': 'error',
		'prefer-template': 'error',
		'no-implicit-coercion': 'error',
		'no-useless-return': 'error',
		'no-useless-rename': 'error',
		'no-useless-concat': 'error',
		'no-useless-constructor': 'error',
		'no-useless-computed-key': 'error',
		'no-empty-function': 'error',
		'no-lone-blocks': 'error',
		'no-sequences': 'error',
		'no-labels': 'error',
		'no-bitwise': 'error',
		'no-proto': 'error',
		'no-eq-null': 'error',
		'no-new': 'error',
		'no-return-assign': ['error', 'always'],
		'no-multi-assign': 'error',
		'no-unneeded-ternary': 'error',
		'no-extend-native': 'error',
		'default-param-last': 'error',
		'class-methods-use-this': 'error',
		'unicorn/no-array-reduce': 'error',
		'unicorn/no-array-for-each': 'error',
		'unicorn/prefer-structured-clone': 'error',
		'unicorn/prefer-node-protocol': 'error',
		'unicorn/prefer-module': 'error',
		'unicorn/no-process-exit': 'error',
		'unicorn/no-abusive-eslint-disable': 'error',
		'unicorn/no-useless-undefined': 'error',
		'unicorn/no-useless-error-capture-stack-trace': 'error',
		'unicorn/no-instanceof-builtins': 'error',
		'unicorn/prefer-ternary': 'off', // fights with `no-nested-ternary` and readability
		'unicorn/filename-case': ['error', { case: 'kebabCase' }],
		'unicorn/no-null': 'off', // `null` is a legitimate value at DB and JSON boundaries
		'oxc/no-accumulating-spread': 'error',
		'oxc/no-map-spread': 'error',
		'oxc/no-barrel-file': ['error', { threshold: 20 }],
		'node/no-process-env': 'error',
		'import/no-default-export': 'error',
		'import/no-cycle': 'error',
		'import/no-self-import': 'error',
		'import/no-duplicates': 'error',
		'import/no-mutable-exports': 'error',
		'import/no-commonjs': 'error',
		'import/first': 'error',
		'import/no-namespace': 'off', // `import * as Foo from "..."` style is fine
		'import/no-unassigned-import': 'off', // allows side-effect imports such as polyfills
		// TypeScript already rejects real redeclarations. This rule also flags value/type pairs that share a name.
		'no-redeclare': 'off',
		'no-inline-comments': 'off',
		'sort-vars': 'off',

		// ── Our own rules ────────────────────────────────────────────────────────────────────────
		'gnkz/no-loose-record': 'error',
		'gnkz/no-unknown-return': 'error',
		'gnkz/no-swallowed-error': 'error',
		'gnkz/no-narration-comments': 'error',
		'gnkz/no-trivial-type-guard': 'error',
		// oxfmt keeps blank lines but never adds them, so paragraph structure is enforced here and
		// `pnpm lint:fix` inserts the missing lines.
		'gnkz/padding-between-statements': 'error',
		'gnkz/padding-between-class-members': 'error',
	},
	overrides: [
		{
			files: ['**/*.test.ts', '**/*.spec.ts'],
			rules: {
				'max-lines-per-function': 'off',
				'max-nested-callbacks': ['error', { max: 5 }],
				'max-statements': 'off',
				'max-lines': 'off',
				'no-magic-numbers': 'off',
				'promise/prefer-await-to-callbacks': 'off',
			},
		},
		{
			// Config files and the oxlint plugin entry must default-export for their tools.
			files: ['*.config.ts', '**/*.config.ts', 'src/index.ts'],
			rules: {
				'import/no-default-export': 'off',
				'no-magic-numbers': 'off',
			},
		},
	],
});
