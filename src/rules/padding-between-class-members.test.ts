import { ruleTester } from '../rule-tester.ts';
import { paddingBetweenClassMembers } from './padding-between-class-members.ts';

ruleTester.run('padding-between-class-members', paddingBetweenClassMembers, {
	valid: [
		'class A {\n\treadonly a = 1;\n\tprivate b = 2;\n\n\trun(): void {}\n}',
		'class A {\n\tconstructor() {}\n\n\t// Why run is public.\n\trun(): void {}\n}',
	],
	invalid: [
		{
			code: 'class A {\n\tconstructor() {}\n\trun(): void {}\n}',
			output: 'class A {\n\tconstructor() {}\n\n\trun(): void {}\n}',
			errors: [{ messageId: 'member' }],
		},
		{
			code: 'class A {\n\treadonly a = 1;\n\t/** Why b exists. */\n\treadonly b = {\n\t\tc: 2,\n\t};\n}',
			output: 'class A {\n\treadonly a = 1;\n\n\t/** Why b exists. */\n\treadonly b = {\n\t\tc: 2,\n\t};\n}',
			errors: [{ messageId: 'member' }],
		},
	],
});
