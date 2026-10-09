import { defineRule } from '@oxlint/plugins';
import type { ESTree } from '@oxlint/plugins';

type FunctionNode = ESTree.ArrowFunctionExpression | ESTree.Function;

type HandlerNode = ESTree.CatchClause | FunctionNode;

interface HandlerFrame {
	readonly kind: 'handler';
	readonly node: HandlerNode;
	rethrows: boolean;
}

interface BoundaryFrame {
	readonly kind: 'boundary';
}

type Frame = BoundaryFrame | HandlerFrame;

function isFunctionNode(node: ESTree.Node): node is FunctionNode {
	return node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression';
}

/** The inline callback passed to `promise.catch(...)`, if there is one. */
function catchCallback(node: ESTree.CallExpression): FunctionNode | undefined {
	const { callee } = node;
	const [handler] = node.arguments;

	const isCatchCall =
		callee.type === 'MemberExpression' && callee.property.type === 'Identifier' && callee.property.name === 'catch';

	return isCatchCall && handler !== undefined && isFunctionNode(handler) ? handler : undefined;
}

/**
 * Bans error handlers that drop the error. A `catch` block, or an inline `.catch()` callback,
 * must either rethrow or do something with the caught value. `catch { return null }` and
 * `.catch(() => undefined)` turn a failure into a wrong value. Code downstream then has nothing
 * to diagnose.
 */
export const noSwallowedError = defineRule({
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow catch handlers that neither rethrow nor use the caught error.',
		},
		messages: {
			swallowed:
				'This handler discards the error. Rethrow it (with `cause`), return it as a typed failure, or handle a specific error you have checked for.',
		},
		schema: [],
	},
	create(context) {
		const frames: Frame[] = [];
		const catchCallbacks = new Set<ESTree.Node>();

		function usesCaughtValue(node: HandlerNode): boolean {
			return context.sourceCode.getDeclaredVariables(node).some((variable) => variable.references.length > 0);
		}

		function enterHandler(node: HandlerNode): void {
			frames.push({ kind: 'handler', node, rethrows: false });
		}

		function exitFrame(): void {
			const frame = frames.pop();

			if (frame?.kind !== 'handler' || frame.rethrows || usesCaughtValue(frame.node)) {
				return;
			}

			context.report({ node: frame.node, messageId: 'swallowed' });
		}

		function enterFunction(node: FunctionNode): void {
			if (catchCallbacks.has(node)) {
				enterHandler(node);
			} else {
				frames.push({ kind: 'boundary' });
			}
		}

		return {
			CallExpression(node) {
				const callback = catchCallback(node);

				if (callback !== undefined) {
					catchCallbacks.add(callback);
				}
			},
			CatchClause: enterHandler,
			'CatchClause:exit': exitFrame,
			ThrowStatement() {
				const frame = frames.at(-1);

				if (frame?.kind === 'handler') {
					frame.rethrows = true;
				}
			},
			ArrowFunctionExpression: enterFunction,
			FunctionDeclaration: enterFunction,
			FunctionExpression: enterFunction,
			'ArrowFunctionExpression:exit': exitFrame,
			'FunctionDeclaration:exit': exitFrame,
			'FunctionExpression:exit': exitFrame,
		};
	},
});
