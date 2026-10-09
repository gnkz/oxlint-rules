import type { OxlintConfig } from 'oxlint';

/**
 * Loads the plugin and turns every rule on as an error. Meant for `extends` in an
 * `oxlint.config.ts`. The specifier resolves from the consuming project, so the package must be
 * installed there.
 */
export const recommended: OxlintConfig = {
	jsPlugins: ['@gnkz/oxlint-rules'],
	rules: {
		'gnkz/no-loose-record': 'error',
		'gnkz/no-narration-comments': 'error',
		'gnkz/no-swallowed-error': 'error',
		'gnkz/no-trivial-type-guard': 'error',
		'gnkz/no-unknown-return': 'error',
		'gnkz/padding-between-class-members': 'error',
		'gnkz/padding-between-statements': 'error',
	},
};
