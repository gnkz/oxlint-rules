import type { Context, Fix, Fixer, SourceCode, Span } from '@oxlint/plugins';

export function isMultiline(node: Span): boolean {
	return node.loc.start.line !== node.loc.end.line;
}

/** Each element paired with the one after it. */
export function adjacentPairs<T>(items: readonly T[]): Array<readonly [T, T]> {
	return items.slice(1).flatMap((next, index) => {
		const previous = items[index];

		return previous === undefined ? [] : [[previous, next] as const];
	});
}

function commentsBetween(sourceCode: SourceCode, previous: Span, next: Span): Span[] {
	return sourceCode.getCommentsBefore(next).filter((comment) => comment.range[0] >= previous.range[1]);
}

/**
 * The comments between two siblings that belong to `next`. A comment on the same line as the end
 * of `previous` is a trailing comment of `previous`, so the blank line goes after it.
 */
function leadingItems(sourceCode: SourceCode, previous: Span, next: Span): Span[] {
	const comments = commentsBetween(sourceCode, previous, next);

	return [...comments.filter((comment) => comment.loc.start.line > previous.loc.end.line), next];
}

function hasBlankLineBetween(sourceCode: SourceCode, previous: Span, next: Span): boolean {
	const items = [previous, ...commentsBetween(sourceCode, previous, next), next];

	return adjacentPairs(items).some(([before, after]) => after.loc.start.line - before.loc.end.line > 1);
}

/**
 * Inserts the blank line above `next` and its leading comments, so a comment stays attached to
 * the code it describes.
 */
function insertBlankLine(sourceCode: SourceCode, previous: Span, next: Span): (fixer: Fixer) => Fix {
	const [first = next] = leadingItems(sourceCode, previous, next);

	if (first.loc.start.line === previous.loc.end.line) {
		return (fixer) => fixer.insertTextBeforeRange(first.range, '\n\n');
	}

	const lineStart = sourceCode.getIndexFromLoc({ line: first.loc.start.line, column: 0 });

	return (fixer) => fixer.insertTextBeforeRange([lineStart, lineStart], '\n');
}

export interface PaddingViolation {
	readonly previous: Span;
	readonly next: Span;
	readonly messageId: string;
}

export function reportMissingBlankLine(context: Context, violation: PaddingViolation): void {
	const { previous, next, messageId } = violation;

	if (hasBlankLineBetween(context.sourceCode, previous, next)) {
		return;
	}

	context.report({ node: next, messageId, fix: insertBlankLine(context.sourceCode, previous, next) });
}
