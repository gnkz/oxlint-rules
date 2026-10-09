import { defineRule } from '@oxlint/plugins';
import type { ESTree } from '@oxlint/plugins';

import { adjacentPairs, isMultiline, reportMissingBlankLine } from '../padding.ts';

const FIELD_TYPES: ReadonlySet<ESTree.ClassElement['type']> = new Set([
	'AccessorProperty',
	'PropertyDefinition',
	'TSAbstractAccessorProperty',
	'TSAbstractPropertyDefinition',
	'TSIndexSignature',
]);

/** A field that fits on one line. A run of these reads as one list and may stay together. */
function isCompactField(member: ESTree.ClassElement): boolean {
	return FIELD_TYPES.has(member.type) && !isMultiline(member);
}

/**
 * Requires a blank line around every class member except runs of single-line fields. Methods,
 * constructors, static blocks and multi-line fields each form their own paragraph, which matches
 * how `gnkz/padding-between-statements` treats functions.
 */
export const paddingBetweenClassMembers = defineRule({
	meta: {
		type: 'layout',
		fixable: 'whitespace',
		docs: {
			description: 'Require blank lines between class members other than single-line fields.',
		},
		messages: {
			member: 'Separate methods and multi-line class members from their neighbours with a blank line.',
		},
		schema: [],
	},
	create(context) {
		return {
			ClassBody: (node) => {
				for (const [previous, next] of adjacentPairs(node.body)) {
					if (!isCompactField(previous) || !isCompactField(next)) {
						reportMissingBlankLine(context, { previous, next, messageId: 'member' });
					}
				}
			},
		};
	},
});
