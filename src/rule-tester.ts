import { RuleTester } from 'oxlint/plugins-dev';
import { describe, it } from 'vitest';

// These wrappers only forward the suites RuleTester generates to vitest. The vitest rules would
// treat them as hand-written tests with dynamic titles and no assertions.
// oxlint-disable vitest/valid-title, vitest/valid-describe-callback, vitest/expect-expect
RuleTester.describe = (text, fn) => {
	describe(text, fn);
};

RuleTester.it = (text, fn) => {
	it(text, fn);
};

// oxlint-enable vitest/valid-title, vitest/valid-describe-callback, vitest/expect-expect

/** Shared tester. Parses every case as a TypeScript module. */
export const ruleTester = new RuleTester({
	languageOptions: { sourceType: 'module', parserOptions: { lang: 'ts' } },
});
