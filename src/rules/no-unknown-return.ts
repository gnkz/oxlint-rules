import { defineRule } from '@oxlint/plugins';
import type { ESTree } from '@oxlint/plugins';

import { referenceName } from '../types.ts';

const PROMISE_TYPES = new Set(['Promise', 'PromiseLike']);

function isUnknownPromise(type: ESTree.TSTypeReference): boolean {
	const name = referenceName(type);
	const [resolved] = type.typeArguments?.params ?? [];

	return name !== undefined && PROMISE_TYPES.has(name) && resolved !== undefined && isUnknownContract(resolved);
}

function isUnknownContract(type: ESTree.TSType): boolean {
	if (type.type === 'TSUnknownKeyword') {
		return true;
	}

	if (type.type === 'TSParenthesizedType') {
		return isUnknownContract(type.typeAnnotation);
	}

	if (type.type === 'TSUnionType') {
		return type.types.some(isUnknownContract);
	}

	return type.type === 'TSTypeReference' && isUnknownPromise(type);
}

interface WithReturnType {
	readonly returnType?: ESTree.TSTypeAnnotation | null | undefined;
}

/**
 * Bans explicit `unknown`, `Promise<unknown>` and `PromiseLike<unknown>` return types. A function
 * knows what it produces. Returning `unknown` passes the job of figuring that out to every
 * caller. Parsers should return the parsed type, or a result union.
 */
export const noUnknownReturn = defineRule({
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow functions that declare an `unknown` return type.',
		},
		messages: {
			unknownReturn:
				'Return type `{{text}}` hides what this function produces. Declare the real type, or a result union for the failure case.',
		},
		schema: [],
	},
	create(context) {
		function check(node: WithReturnType): void {
			const annotation = node.returnType;

			if (annotation === null || annotation === undefined) {
				return;
			}

			if (isUnknownContract(annotation.typeAnnotation)) {
				context.report({
					node: annotation,
					messageId: 'unknownReturn',
					data: { text: context.sourceCode.getText(annotation.typeAnnotation) },
				});
			}
		}

		return {
			ArrowFunctionExpression: check,
			FunctionDeclaration: check,
			FunctionExpression: check,
			TSCallSignatureDeclaration: check,
			TSDeclareFunction: check,
			TSEmptyBodyFunctionExpression: check,
			TSFunctionType: check,
			TSMethodSignature: check,
		};
	},
});
