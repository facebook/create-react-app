import { parse } from '../../utils/parser';

test('throws on null', () => {
  expect.assertions(2);
  try {
    parse(null);
  } catch (e) {
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe('You cannot pass a null object.');
  }
});

test('throws on unparsable', () => {
  expect.assertions(2);
  try {
    parse({});
  } catch (e) {
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe(
      'The error you provided does not contain a stack trace.'
    );
  }
});
