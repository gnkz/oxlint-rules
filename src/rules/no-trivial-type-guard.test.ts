import { ruleTester } from '../rule-tester.ts';
import { noTrivialTypeGuard } from './no-trivial-type-guard.ts';

ruleTester.run('no-trivial-type-guard', noTrivialTypeGuard, {
	valid: [
		'const isUser = (value: unknown): value is User => schema.safeParse(value).success;',
		"function isString(value: unknown): value is string { return typeof value === 'string'; }",
		"function assertUser(value: unknown): asserts value is User { if (!isUser(value)) { throw new TypeError('not a user'); } }",
		'function always(): boolean { return true; }',
	],
	invalid: [
		{
			code: 'const isUser = (value: unknown): value is User => true;',
			errors: [{ messageId: 'trivialGuard' }],
		},
		{
			code: 'function isUser(value: unknown): value is User { return true; }',
			errors: [{ messageId: 'trivialGuard' }],
		},
		{
			code: 'function assertUser(value: unknown): asserts value is User {}',
			errors: [{ messageId: 'trivialGuard' }],
		},
	],
});
