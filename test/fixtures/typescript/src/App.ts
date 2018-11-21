interface MyType {
  foo: number;
  bar: boolean;
  baz?: { n: number };
}

type MyObject = Pick<MyType, 'bar' | 'baz'>;

@annotation
class App {
  static foo: MyObject = { bar: true, baz: { n: 123 } };
  n = App.foo.baz!.n;
}

function annotation(target: any) {
  target.annotated = true;
}

export default App;
