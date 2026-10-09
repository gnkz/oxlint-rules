import { defineRule } from '@oxlint/plugins';
import type { ESTree } from '@oxlint/plugins';

type Finding = 'changelog' | 'conversation' | 'emoji' | 'restating';

interface Pattern {
	readonly finding: Finding;
	readonly regex: RegExp;
}

/** Checked against the first line of a comment, where narration starts. */
const LEADING_PATTERNS: readonly Pattern[] = [
	{
		finding: 'changelog',
		regex:
			/^(?:added|updated|changed|modified|fixed|removed|refactored|replaced|renamed|moved|reverted|previously|originally)\b/iu,
	},
	{ finding: 'restating', regex: /^step\s+\d+\b/iu },
	{ finding: 'restating', regex: /^(?:now|here|below|next|first|then|finally),?\s+(?:we|i)\b/iu },
	{ finding: 'restating', regex: /^let'?s\b/iu },
	{
		finding: 'restating',
		regex: /^this\s+(?:function|method|class|helper|variable|constant|line|block|code|file|module)\b/iu,
	},
];

/** Checked against every line. */
const ANYWHERE_PATTERNS: readonly Pattern[] = [
	{ finding: 'emoji', regex: /\p{Extended_Pictographic}/u },
	{
		finding: 'conversation',
		regex: /\b(?:as requested|per (?:your|the user'?s?) request|as you (?:asked|requested|suggested))\b/iu,
	},
	{
		finding: 'changelog',
		regex: /\b(?:new|old|updated|improved|enhanced|refactored) (?:implementation|version|logic|approach)\b/iu,
	},
];

const DIRECTIVE = /^(?:\s*(?:eslint|oxlint)[-\s]|\s*@ts-|\/\s*<reference|\s*#(?:end)?region\b)/u;

function commentLines(comment: ESTree.Comment): string[] {
	return comment.value
		.split('\n')
		.map((line) => line.replace(/^\s*\*?\s*/u, '').trim())
		.filter((line) => line.length > 0);
}

function findNarration(lines: readonly string[], isContinuation: boolean): Finding | undefined {
	const [first] = lines;

	const leading =
		first === undefined || isContinuation ? undefined : LEADING_PATTERNS.find((pattern) => pattern.regex.test(first));

	const anywhere = ANYWHERE_PATTERNS.find((pattern) => lines.some((line) => pattern.regex.test(line)));

	return (leading ?? anywhere)?.finding;
}

/**
 * Bans comments that describe the editing session rather than the code. Examples: changelog
 * notes ("Added retry logic"), step-by-step walkthroughs ("Step 2: ...", "Now we ..."), comments
 * that restate the code ("This function ..."), remarks addressed to the person in a chat, and
 * emoji. Git history records what changed. Comments should explain why the code is the way it is.
 */
export const noNarrationComments = defineRule({
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow changelog, walkthrough and conversational comments.',
		},
		messages: {
			changelog:
				'Comment describes a change, not the code. Put history in the commit message, and keep the comment for intent.',
			conversation: 'Comment is addressed to a person in a chat. Remove it.',
			emoji: 'Comments must not contain emoji.',
			restating: 'Comment narrates or restates the code. Delete it, or explain *why* the code does this.',
		},
		schema: [],
	},
	create(context) {
		return {
			Program() {
				let previousLineCommentEnd = -1;

				for (const comment of context.sourceCode.getAllComments()) {
					const isLine = comment.type === 'Line';
					const isContinuation = isLine && comment.loc.start.line === previousLineCommentEnd + 1;

					previousLineCommentEnd = isLine ? comment.loc.end.line : -1;

					if (comment.type === 'Shebang' || DIRECTIVE.test(comment.value)) {
						continue;
					}

					const finding = findNarration(commentLines(comment), isContinuation);

					if (finding !== undefined) {
						context.report({ loc: comment.loc, messageId: finding });
					}
				}
			},
		};
	},
});
