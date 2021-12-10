import * as React from 'react';

interface MyType {
  foo: number;
  bar: boolean;
  baz?: { n: number };
}

function assertIsString(val: any): asserts val is string {
  if (typeof val !== 'string') {
    throw new Error('Not a string!');
  }
}

const foo: any = 'bar';
assertIsString(foo);

type MyObject = Pick<MyType, 'bar' | 'baz'>;

class App extends React.Component {
  static foo: MyObject = { bar: true, baz: { n: 123 } };
  n = App.foo?.baz!.n ?? 'foo';

  render() {
    return <div />;
  }
}

export default App;
