import { describe, expect, it } from 'vitest';

import { recommended } from './configs.ts';
import plugin from './index.ts';

describe('recommended', () => {
	it('enables every rule the plugin defines', () => {
		const expected = Object.fromEntries(Object.keys(plugin.rules).map((name) => [`gnkz/${name}`, 'error']));

		expect(recommended.rules).toStrictEqual(expected);
	});
});
