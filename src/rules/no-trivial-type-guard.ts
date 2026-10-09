import { defineRule } from '@oxlint/plugins';
import type { ESTree } from '@oxlint/plugins';

type FunctionNode = ESTree.ArrowFunctionExpression | ESTree.Function;

function isBooleanLiteral(node: ESTree.Node | null): boolean {
	return node?.type === 'Literal' && typeof node.value === 'boolean';
}

function returnsConstantBoolean(body: ESTree.FunctionBody | ESTree.Expression): boolean {
	if (body.type !== 'BlockStatement') {
		return isBooleanLiteral(body);
	}

	const [only] = body.body;

	return body.body.length === 1 && only?.type === 'ReturnStatement' && isBooleanLiteral(only.argument);
}

/**
 * Bans type predicates and assertion functions that do not inspect their input:
 * `(x): x is User => true`, and `asserts x is User` functions with an empty body. With `as` banned,
 * these are the remaining way to cast without checking anything.
 */
export const noTrivialTypeGuard = defineRule({
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow type guards and assertion functions that never check their input.',
		},
		messages: {
			trivialGuard:
				'This type guard does not inspect its input. It is an unchecked cast. Check the value for real, or parse it with a schema.',
		},
		schema: [],
	},
	create(context) {
		function check(node: FunctionNode): void {
			const predicate = node.returnType?.typeAnnotation;

			if (predicate?.type !== 'TSTypePredicate' || node.body === null) {
				return;
			}

			const isTrivial = predicate.asserts
				? node.body.type === 'BlockStatement' && node.body.body.length === 0
				: returnsConstantBoolean(node.body);

			if (isTrivial) {
				context.report({ node: predicate, messageId: 'trivialGuard' });
			}
		}

		return {
			ArrowFunctionExpression: check,
			FunctionDeclaration: check,
			FunctionExpression: check,
		};
	},
});
