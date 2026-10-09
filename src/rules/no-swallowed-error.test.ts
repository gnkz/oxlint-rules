import { ruleTester } from '../rule-tester.ts';
import { noSwallowedError } from './no-swallowed-error.ts';

ruleTester.run('no-swallowed-error', noSwallowedError, {
	valid: [
		"try { run(); } catch (error) { throw new AppError('run failed', { cause: error }); }",
		'try { run(); } catch (error) { return failure(error); }',
		"try { run(); } catch { throw new AppError('run failed'); }",
		'try { run(); } catch (error) { if (isNotFound(error)) { return undefined; } throw error; }',
		'promise.catch((error) => report(error));',
		'promise.catch(handleError);',
		"promise.catch(() => { throw new AppError('lost'); });",
	],
	invalid: [
		{ code: 'try { run(); } catch { return null; }', errors: [{ messageId: 'swallowed' }] },
		{ code: 'try { run(); } catch (error) { return null; }', errors: [{ messageId: 'swallowed' }] },
		{
			code: "try { run(); } catch { const fail = () => { throw new Error('x'); }; }",
			errors: [{ messageId: 'swallowed' }],
		},
		{ code: 'promise.catch(() => undefined);', errors: [{ messageId: 'swallowed' }] },
		{ code: 'promise.catch(function () {});', errors: [{ messageId: 'swallowed' }] },
		{ code: 'promise.catch((error) => null);', errors: [{ messageId: 'swallowed' }] },
	],
});
