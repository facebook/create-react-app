import { getLinesAround } from '../utils/getLinesAround';

const arr = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

test('should return lines around from a string', () => {
  expect(getLinesAround(4, 2, arr)).toMatchSnapshot();
});

test('should return lines around from an array', () => {
  expect(getLinesAround(4, 2, arr.join('\n'))).toMatchSnapshot();
});
