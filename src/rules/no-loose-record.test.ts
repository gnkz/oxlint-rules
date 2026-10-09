import { ruleTester } from '../rule-tester.ts';
import { noLooseRecord } from './no-loose-record.ts';

ruleTester.run('no-loose-record', noLooseRecord, {
	valid: [
		'type Scores = Record<string, number>;',
		'type Flags = Record<"a" | "b", boolean>;',
		'type Index = { [id: string]: User };',
		'function merge<T extends Record<string, unknown>>(value: T): T { return value; }',
		'function keys<T extends { [key: string]: unknown }>(value: T): string[] { return Object.keys(value); }',
		'type Mapped = { [K in Keys]: unknown };',
	],
	invalid: [
		{ code: 'type Bag = Record<string, unknown>;', errors: [{ messageId: 'looseRecord' }] },
		{ code: 'let bag: Record<string, any>;', errors: [{ messageId: 'looseRecord' }] },
		{ code: 'type Bag = Record<string, object>;', errors: [{ messageId: 'looseRecord' }] },
		{ code: 'type Bag = Record<string, {}>;', errors: [{ messageId: 'looseRecord' }] },
		{
			code: 'type Bag = Record<string, string | unknown>;',
			errors: [{ messageId: 'looseRecord' }],
		},
		{ code: 'interface Bag { [key: string]: unknown }', errors: [{ messageId: 'looseRecord' }] },
		{ code: 'type Bag = { [K in string]: any };', errors: [{ messageId: 'looseRecord' }] },
		{
			code: 'function read(input: Record<string, unknown>): void {}',
			errors: [{ messageId: 'looseRecord' }],
		},
	],
});
