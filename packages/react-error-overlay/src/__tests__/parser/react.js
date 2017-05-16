import { parse } from '../../utils/parser';

test('15.y.z', () => {
  expect(
    parse(
      `Warning: Each child in array should have a unique "key" prop. Check render method of \`FileA\`.
     in div (at FileA.js:9)
     in FileA (at App.js:9)
     in div (at App.js:8)
     in App (at index.js:7)`
    )
  ).toMatchSnapshot();
});
