import { defineRule } from '@oxlint/plugins';
import type { ESTree } from '@oxlint/plugins';

import { adjacentPairs, isMultiline, reportMissingBlankLine } from '../padding.ts';

type StatementKind = 'import' | 'jump' | 'other' | 'reexport' | 'type' | 'variable';

type Statement = ESTree.Directive | ESTree.Statement;

const BLOCK_LIKE: ReadonlySet<ESTree.Node['type']> = new Set([
	'BlockStatement',
	'ClassDeclaration',
	'DoWhileStatement',
	'ForInStatement',
	'ForOfStatement',
	'ForStatement',
	'FunctionDeclaration',
	'IfStatement',
	'LabeledStatement',
	'SwitchStatement',
	'TryStatement',
	'TSEnumDeclaration',
	'TSModuleDeclaration',
	'WhileStatement',
]);

const KIND_BY_TYPE: ReadonlyMap<ESTree.Node['type'], StatementKind> = new Map([
	['ImportDeclaration', 'import'],
	['TSImportEqualsDeclaration', 'import'],
	['ExportAllDeclaration', 'reexport'],
	['VariableDeclaration', 'variable'],
	['TSTypeAliasDeclaration', 'type'],
	['TSInterfaceDeclaration', 'type'],
	['ReturnStatement', 'jump'],
	['ThrowStatement', 'jump'],
]);

/** The declaration an `export` wraps, so `export const` pads like `const`. */
function unwrapExport(node: Statement): ESTree.Node {
	if (node.type === 'ExportNamedDeclaration') {
		return node.declaration ?? node;
	}

	return node.type === 'ExportDefaultDeclaration' ? node.declaration : node;
}

function kindOf(node: Statement): StatementKind {
	if (node.type === 'ExportNamedDeclaration' && node.source !== null) {
		return 'reexport';
	}

	return KIND_BY_TYPE.get(unwrapExport(node).type) ?? 'other';
}

function isBlockLike(node: Statement): boolean {
	return BLOCK_LIKE.has(unwrapExport(node).type);
}

/** Overload signatures sit directly above their implementation. */
function isOverloadPair(previous: Statement, next: Statement): boolean {
	return unwrapExport(previous).type === 'TSDeclareFunction' && isBlockLike(next);
}

function paddingReason(previous: Statement, next: Statement): string | undefined {
	const previousKind = kindOf(previous);
	const nextKind = kindOf(next);

	if ((previousKind === 'import' || previousKind === 'reexport') && previousKind === nextKind) {
		return undefined;
	}

	if (isOverloadPair(previous, next)) {
		return undefined;
	}

	if (isBlockLike(previous) || isBlockLike(next)) {
		return 'blockLike';
	}

	if (isMultiline(previous) || isMultiline(next)) {
		return 'multiline';
	}

	return previousKind === nextKind ? undefined : 'kindChange';
}

/**
 * Requires a blank line between statements that belong to different groups. Blank lines split a
 * body into paragraphs: a run of declarations, a run of calls, a control-flow block, the final
 * `return`. Without them every line reads with the same weight and the reader has to find the
 * structure on their own.
 *
 * A blank line is required around block-like statements (`if`, loops, `try`, function and class
 * declarations) and around any statement that spans several lines. Single-line statements may be
 * grouped only with statements of the same kind: imports, re-exports, variable declarations, type
 * declarations, `return`/`throw`, or other statements.
 */
export const paddingBetweenStatements = defineRule({
	meta: {
		type: 'layout',
		fixable: 'whitespace',
		docs: {
			description: 'Require blank lines that separate statements into related groups.',
		},
		messages: {
			blockLike:
				'Separate block statements and function or class declarations from their neighbours with a blank line.',
			multiline: 'Separate statements that span several lines from their neighbours with a blank line.',
			kindChange:
				'Add a blank line where the statement kind changes (declarations, other statements, return or throw).',
		},
		schema: [],
	},
	create(context) {
		function checkBody(body: readonly Statement[]): void {
			for (const [previous, next] of adjacentPairs(body)) {
				const messageId = paddingReason(previous, next);

				if (messageId !== undefined) {
					reportMissingBlankLine(context, { previous, next, messageId });
				}
			}
		}

		return {
			Program: (node) => {
				checkBody(node.body);
			},
			BlockStatement: (node) => {
				checkBody(node.body);
			},
			StaticBlock: (node) => {
				checkBody(node.body);
			},
			TSModuleBlock: (node) => {
				checkBody(node.body);
			},
			SwitchCase: (node) => {
				checkBody(node.consequent);
			},
		};
	},
});
