import { ScriptLine } from '../utils/stack-frame';

test('script line shape', () => {
  expect(new ScriptLine(5, 'foobar', true)).toMatchSnapshot();
});

test('script line to provide default highlight', () => {
  expect(new ScriptLine(5, 'foobar')).toMatchSnapshot();
});
