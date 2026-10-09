import { ruleTester } from '../rule-tester.ts';
import { noNarrationComments } from './no-narration-comments.ts';

ruleTester.run('no-narration-comments', noNarrationComments, {
	valid: [
		'// Retries are capped because the upstream rate-limits per minute.\nconst retries = 3;',
		'// The cache entry is invalidated when the row is\n// updated by the sync worker.\nconst ttl = 60;',
		'/**\n * Parses a user id from the session cookie.\n */\nfunction parse() {}',
		'// oxlint-disable-next-line no-console\nconsole.log(1);',
		'// @ts-expect-error -- upstream types are wrong\nfoo();',
		'// Thisfunction is not a match.\nconst value = 1;',
	],
	invalid: [
		{ code: '// Added retry logic\nconst retries = 3;', errors: [{ messageId: 'changelog' }] },
		{ code: '// Updated to use the new API\ncall();', errors: [{ messageId: 'changelog' }] },
		{ code: '// Use the new implementation\ncall();', errors: [{ messageId: 'changelog' }] },
		{ code: '// Step 2: validate input\nvalidate();', errors: [{ messageId: 'restating' }] },
		{ code: '// Now we parse the body\nparse();', errors: [{ messageId: 'restating' }] },
		{ code: "// Let's check the cache\ncheck();", errors: [{ messageId: 'restating' }] },
		{
			code: '/** This function parses input. */\nfunction parse() {}',
			errors: [{ messageId: 'restating' }],
		},
		{ code: '// Validate input ✅\nvalidate();', errors: [{ messageId: 'emoji' }] },
		{ code: '// Renamed as requested\nconst a = 1;', errors: [{ messageId: 'changelog' }] },
		{ code: '// Uses a map, as you asked\nconst a = 1;', errors: [{ messageId: 'conversation' }] },
	],
});
