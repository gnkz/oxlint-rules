import { defineRule } from '@oxlint/plugins';
import type { ESTree } from '@oxlint/plugins';

import { isInTypeParameterConstraint, isWeakValueType, referenceName } from '../types.ts';

/**
 * Bans dictionary types whose values are `unknown`, `any`, `object` or `{}`: `Record<string,
 * unknown>`, `{ [key: string]: unknown }` and `{ [K in string]: unknown }`. These are "some
 * object" types: nothing about the data is known, so every read becomes a cast or a runtime
 * guess. Generic constraints (`T extends Record<string, unknown>`) are allowed.
 */
export const noLooseRecord = defineRule({
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow dictionary types with `unknown`/`any`/`object`/`{}` values.',
		},
		messages: {
			looseRecord:
				'`{{text}}` says nothing about its contents. Model the real fields, or parse the input at the boundary into a typed value.',
		},
		schema: [],
	},
	create(context) {
		function report(node: ESTree.Node): void {
			if (isInTypeParameterConstraint(node)) {
				return;
			}

			context.report({
				node,
				messageId: 'looseRecord',
				data: { text: context.sourceCode.getText(node) },
			});
		}

		return {
			TSTypeReference(node) {
				const valueType = node.typeArguments?.params[1];

				if (referenceName(node) === 'Record' && valueType !== undefined) {
					if (isWeakValueType(valueType)) {
						report(node);
					}
				}
			},
			TSIndexSignature(node) {
				if (isWeakValueType(node.typeAnnotation.typeAnnotation)) {
					report(node);
				}
			},
			TSMappedType(node) {
				const isOpenKey = node.constraint.type === 'TSStringKeyword';

				if (isOpenKey && node.typeAnnotation !== null && isWeakValueType(node.typeAnnotation)) {
					report(node);
				}
			},
		};
	},
});
