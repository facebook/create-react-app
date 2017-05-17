import { StackFrame } from '../utils/stack-frame';

test('proper empty shape', () => {
  const empty = new StackFrame();
  expect(empty).toMatchSnapshot();

  expect(empty.getFunctionName()).toBe(null);
  expect(empty.getSource()).toBe('');
  expect(empty.toString()).toBe('');
});

test('proper full shape', () => {
  const empty = new StackFrame(
    'a',
    'b.js',
    13,
    37,
    undefined,
    'apple',
    'test.js',
    37,
    13
  );
  expect(empty).toMatchSnapshot();

  expect(empty.getFunctionName()).toBe('a');
  expect(empty.getSource()).toBe('b.js:13:37');
  expect(empty.toString()).toBe('a (b.js:13:37)');
});
