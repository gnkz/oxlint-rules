import { definePlugin } from '@oxlint/plugins';

import { noLooseRecord } from './rules/no-loose-record.ts';
import { noNarrationComments } from './rules/no-narration-comments.ts';
import { noSwallowedError } from './rules/no-swallowed-error.ts';
import { noTrivialTypeGuard } from './rules/no-trivial-type-guard.ts';
import { noUnknownReturn } from './rules/no-unknown-return.ts';
import { paddingBetweenClassMembers } from './rules/padding-between-class-members.ts';
import { paddingBetweenStatements } from './rules/padding-between-statements.ts';

const plugin = definePlugin({
	meta: { name: 'gnkz' },
	rules: {
		'no-loose-record': noLooseRecord,
		'no-narration-comments': noNarrationComments,
		'no-swallowed-error': noSwallowedError,
		'no-trivial-type-guard': noTrivialTypeGuard,
		'no-unknown-return': noUnknownReturn,
		'padding-between-class-members': paddingBetweenClassMembers,
		'padding-between-statements': paddingBetweenStatements,
	},
});

// oxlint loads JS plugins through their default export.
export default plugin;
