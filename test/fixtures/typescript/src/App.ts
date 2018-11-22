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
  @propertyDecorator
  decorated;
}

function annotation(target: any) {
  target.annotated = true;
}

function propertyDecorator(target: any, key: string) {
  if (delete target[key]) {
    Object.defineProperty(target, key, {
      get() {
        return 42;
      },
      enumerable: true,
    });
  }
}

export default App;
