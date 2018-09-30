class App {
  constructor(props) {
    super(props);
    this.foo = this.foo.bind(this);
  }
  foo: void => void;
  foo() {
    return 'bar';
  }
}

export default App;
