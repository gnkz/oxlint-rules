<img src="assets/icon.svg" width="64" height="64" alt="">

# @gnkz/oxlint-rules

Opinionated rules for [oxlint](https://oxc.rs/docs/guide/usage/linter), shipped as a JS plugin. They target
code that type-checks but hides what it does: loose `Record<string, unknown>` types, `unknown` return
contracts, swallowed errors, fake type guards, comments that narrate an editing session, and bodies
with no paragraph structure.

## Install

```sh
pnpm add -D oxlint @gnkz/oxlint-rules
# or: npm install -D oxlint @gnkz/oxlint-rules
```

Requires `oxlint` 1.87 or newer.

## Usage

The plugin registers its rules under the `gnkz/` prefix.

### `oxlint.config.ts`

Extend the `recommended` preset, which loads the plugin and enables every rule as an error:

```ts
import { recommended } from '@gnkz/oxlint-rules/configs';
import { defineConfig } from 'oxlint';

export default defineConfig({
	extends: [recommended],
	rules: {
		'gnkz/no-narration-comments': 'warn',
	},
});
```

Or load the plugin and pick rules yourself:

```ts
import { defineConfig } from 'oxlint';

export default defineConfig({
	jsPlugins: ['@gnkz/oxlint-rules'],
	rules: {
		'gnkz/no-loose-record': 'error',
		'gnkz/no-swallowed-error': 'error',
	},
});
```

### `.oxlintrc.json`

```json
{
	"jsPlugins": ["@gnkz/oxlint-rules"],
	"rules": {
		"gnkz/no-loose-record": "error",
		"gnkz/no-unknown-return": "error",
		"gnkz/no-swallowed-error": "error",
		"gnkz/no-narration-comments": "error",
		"gnkz/no-trivial-type-guard": "error",
		"gnkz/padding-between-statements": "error",
		"gnkz/padding-between-class-members": "error"
	}
}
```

### Custom prefix

Give the plugin a different prefix with the object form of `jsPlugins`:

```json
{
	"jsPlugins": [{ "name": "acme", "specifier": "@gnkz/oxlint-rules" }],
	"rules": { "acme/no-loose-record": "error" }
}
```

## Rules

| Rule                                                                          | Fixable | Description                                                              |
| ----------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| [`no-loose-record`](src/rules/no-loose-record.ts)                             |         | Disallow dictionary types with `unknown`/`any`/`object`/`{}` values.     |
| [`no-narration-comments`](src/rules/no-narration-comments.ts)                 |         | Disallow changelog, walkthrough and conversational comments.             |
| [`no-swallowed-error`](src/rules/no-swallowed-error.ts)                       |         | Disallow catch handlers that neither rethrow nor use the caught error.   |
| [`no-trivial-type-guard`](src/rules/no-trivial-type-guard.ts)                 |         | Disallow type guards and assertion functions that never check input.     |
| [`no-unknown-return`](src/rules/no-unknown-return.ts)                         |         | Disallow functions that declare an `unknown` return type.                |
| [`padding-between-class-members`](src/rules/padding-between-class-members.ts) | ✅      | Require blank lines between class members other than single-line fields. |
| [`padding-between-statements`](src/rules/padding-between-statements.ts)       | ✅      | Require blank lines that separate statements into related groups.        |

### `no-loose-record`

Bans `Record<string, unknown>`, `{ [key: string]: unknown }` and `{ [K in string]: unknown }` (also with
`any`, `object` or `{}` values). These types say nothing about the data, so every read becomes a cast or
a runtime guess. Generic constraints such as `T extends Record<string, unknown>` are allowed.

### `no-narration-comments`

Bans comments that describe the editing session rather than the code: changelog notes
(`// Added retry logic`), walkthroughs (`// Step 2: ...`, `// Now we ...`), comments that restate the
code (`// This function ...`), remarks addressed to someone in a chat (`// as requested`) and emoji.
Lint directives, `@ts-` comments, triple-slash references and `#region` markers are ignored.

### `no-swallowed-error`

A `catch` block or an inline `.catch()` callback must rethrow or use the caught value. `catch { return
null }` and `.catch(() => undefined)` turn a failure into a wrong value that downstream code cannot
diagnose.

### `no-trivial-type-guard`

Bans type predicates that return a constant (`(x): x is User => true`) and `asserts x is User`
functions with an empty body. Both are unchecked casts.

### `no-unknown-return`

Bans explicit `unknown`, `Promise<unknown>` and `PromiseLike<unknown>` return types, including in
unions. A function knows what it produces. Parsers should return the parsed type or a result union.

### `padding-between-statements`

Requires a blank line around block-like statements (`if`, loops, `try`, function and class
declarations) and around statements spanning several lines. Single-line statements may stay together
only with statements of the same kind: imports, re-exports, variable declarations, type declarations,
`return`/`throw`, or other statements. Overload signatures may sit directly above their implementation.
`oxlint --fix` inserts the missing lines above any leading comments.

### `padding-between-class-members`

Requires a blank line around every class member except runs of single-line fields. Methods,
constructors, static blocks and multi-line fields each form their own paragraph.

## Development

```sh
pnpm install
pnpm check   # format, lint, typecheck, test and build
```

The repository lints itself with the rules from `src` (see `oxlint.config.ts`). Rule tests use oxlint's
`RuleTester` running under vitest.

## Releasing

Releases are published to npm by [`.github/workflows/release.yml`](.github/workflows/release.yml) using
[trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC), so no npm token is stored in
GitHub. Packages get a provenance attestation.

1. Bump `version` in `package.json` and commit.
2. Tag and push: `git tag v0.2.0 && git push origin main v0.2.0`.

The workflow runs the full check, verifies the tag matches `package.json`, publishes, and creates a
GitHub release with generated notes. Versions with a prerelease suffix (`1.0.0-beta.1`) are published
under the `next` dist-tag.

## License

[MIT](LICENSE)
