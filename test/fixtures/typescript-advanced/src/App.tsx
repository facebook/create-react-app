import * as React from 'react';

interface MyType {
  foo: number;
  bar: boolean;
  baz?: { n: number };
}

type MyObject = Pick<MyType, 'bar' | 'baz'>;

class App extends React.Component {
  static foo: MyObject = { bar: true, baz: { n: 123 } };
  n = App.foo.baz!.n;

  render() {
    return <div />;
  }
}

export default App;
