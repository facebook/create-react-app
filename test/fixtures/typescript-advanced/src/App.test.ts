import App from './App';

it('reads a typescript file with no syntax error', () => {
  const app = new App({});
  expect(App.foo.bar).toBe(true);
  expect(App.foo.baz!.n).toBe(123);
  expect(app.n).toBe(123);
});
