import type { ESTree } from '@oxlint/plugins';

const WEAK_KEYWORDS: ReadonlySet<ESTree.TSType['type']> = new Set([
	'TSAnyKeyword',
	'TSObjectKeyword',
	'TSUnknownKeyword',
]);

/**
 * Value types that carry no information about their contents. A dictionary or return contract
 * built from them pushes all of the type checking onto the caller.
 */
export function isWeakValueType(type: ESTree.TSType): boolean {
	if (WEAK_KEYWORDS.has(type.type)) {
		return true;
	}

	if (type.type === 'TSTypeLiteral') {
		return type.members.length === 0;
	}

	if (type.type === 'TSParenthesizedType') {
		return isWeakValueType(type.typeAnnotation);
	}

	return type.type === 'TSUnionType' && type.types.some(isWeakValueType);
}

/** `Foo` for `Foo<...>`, `undefined` for qualified or `this` type references. */
export function referenceName(type: ESTree.TSTypeReference): string | undefined {
	return type.typeName.type === 'Identifier' ? type.typeName.name : undefined;
}

/** Whether `node` sits inside the `extends` clause of a generic type parameter. */
export function isInTypeParameterConstraint(node: ESTree.Node): boolean {
	let child = node;
	let { parent } = node;

	while (parent !== null) {
		if (parent.type === 'TSTypeParameter' && parent.constraint === child) {
			return true;
		}

		child = parent;
		({ parent } = parent);
	}

	return false;
}
