import { ruleTester } from '../rule-tester.ts';
import { noUnknownReturn } from './no-unknown-return.ts';

ruleTester.run('no-unknown-return', noUnknownReturn, {
	valid: [
		'function parse(input: string): User { return decode(input); }',
		'const load = async (): Promise<User> => fetchUser();',
		'function isUser(value: unknown): value is User { return check(value); }',
		'type Getter = () => string;',
		'function infer() { return 1; }',
	],
	invalid: [
		{
			code: 'function parse(input: string): unknown { return JSON.parse(input); }',
			errors: [{ messageId: 'unknownReturn' }],
		},
		{
			code: 'const load = async (): Promise<unknown> => fetchAnything();',
			errors: [{ messageId: 'unknownReturn' }],
		},
		{ code: 'type Getter = () => PromiseLike<unknown>;', errors: [{ messageId: 'unknownReturn' }] },
		{ code: 'interface Api { get(): unknown }', errors: [{ messageId: 'unknownReturn' }] },
		{
			code: 'declare function read(): string | unknown;',
			errors: [{ messageId: 'unknownReturn' }],
		},
		{
			code: 'class Store { read(): unknown { return this.value; } }',
			errors: [{ messageId: 'unknownReturn' }],
		},
	],
});
