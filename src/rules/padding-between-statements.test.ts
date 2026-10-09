import { ruleTester } from '../rule-tester.ts';
import { paddingBetweenStatements } from './padding-between-statements.ts';

ruleTester.run('padding-between-statements', paddingBetweenStatements, {
	valid: [
		"import { a } from 'a';\nimport {\n\tb,\n\tc,\n} from 'b';\n\nconst x = a;",
		"export { a } from './a.ts';\nexport * from './b.ts';",
		'const a = 1;\nconst b = 2;\n\nrun(a, b);\nlog(a);\n\nreturn a;',
		'type A = string;\ninterface B { a: A }\n\nconst value = 1;',
		'function a() {}\n\nfunction b() {}',
		'if (ready) {\n\tstart();\n}\n\nstop();',
		'const a = 1;\n\nconst b = {\n\tc: 2,\n};',
		'const a = 1; // trailing reason\n\n// Leading reason.\nrun(a);',
		'switch (value) {\n\tcase 1:\n\t\trun();\n\t\tbreak;\n}',
		'function f(a: string): void;\nfunction f(a: number): void;\nfunction f(a: string | number): void {\n\trun(a);\n}',
		'function f() {\n\treturn 1;\n}',
	],
	invalid: [
		{
			code: 'const a = 1;\nrun(a);',
			output: 'const a = 1;\n\nrun(a);',
			errors: [{ messageId: 'kindChange' }],
		},
		{
			code: 'run();\nreturn value;',
			output: 'run();\n\nreturn value;',
			errors: [{ messageId: 'kindChange' }],
		},
		{
			code: 'export const A = {\n\ta: 1,\n} as const;\nconst b = 2;',
			output: 'export const A = {\n\ta: 1,\n} as const;\n\nconst b = 2;',
			errors: [{ messageId: 'multiline' }],
		},
		{
			code: 'function a() {}\nexport function b() {}',
			output: 'function a() {}\n\nexport function b() {}',
			errors: [{ messageId: 'blockLike' }],
		},
		{
			code: 'function outer() {\n\tconst a = 1;\n\tif (a) {\n\t\trun();\n\t}\n}',
			output: 'function outer() {\n\tconst a = 1;\n\n\tif (a) {\n\t\trun();\n\t}\n}',
			errors: [{ messageId: 'blockLike' }],
		},
		{
			code: 'const a = 1; // trailing reason\n// Leading reason.\nrun(a);',
			output: 'const a = 1; // trailing reason\n\n// Leading reason.\nrun(a);',
			errors: [{ messageId: 'kindChange' }],
		},
		{
			code: "import { a } from 'a';\nconst b = a;",
			output: "import { a } from 'a';\n\nconst b = a;",
			errors: [{ messageId: 'kindChange' }],
		},
		{
			code: 'switch (value) {\n\tcase 1:\n\t\tconst a = 1;\n\t\trun(a);\n}',
			output: 'switch (value) {\n\tcase 1:\n\t\tconst a = 1;\n\n\t\trun(a);\n}',
			errors: [{ messageId: 'kindChange' }],
		},
	],
});
