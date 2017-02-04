import React from 'react';

class BuiltEmitter extends React.Component {
  constructor(props) {
    super(props)

    this.callWhenDone = done => done();
  }

  componentDidMount() {
    this.callWhenDone(() => document.dispatchEvent(new Event('ReactFeatureDidMount')));
  }

  render() {
    const feature = React.cloneElement(React.Children.only(this.props.children), {
      setCallWhenDone: done => {
        this.callWhenDone = done;
      }
    });

    return <div>{feature}</div>;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { feature: null };

    this.setFeature = this.setFeature.bind(this);
  }

  componentDidMount() {
    switch (location.hash.slice(1)) {
      case 'array-destructuring':
        require.ensure([], () => this.setFeature(require('./features/syntax/ArrayDestructuring').default));
        break;
      case 'array-spread':
        require.ensure([], () => this.setFeature(require('./features/syntax/ArraySpread').default));
        break;
      case 'async-await':
        require.ensure([], () => this.setFeature(require('./features/syntax/AsyncAwait').default));
        break;
      case 'class-properties':
        require.ensure([], () => this.setFeature(require('./features/syntax/ClassProperties').default));
        break;
      case 'computed-properties':
        require.ensure([], () => this.setFeature(require('./features/syntax/ComputedProperties').default));
        break;
      case 'css-inclusion':
        require.ensure([], () => this.setFeature(require('./features/webpack/CssInclusion').default));
        break;
      case 'custom-interpolation':
        require.ensure([], () => this.setFeature(require('./features/syntax/CustomInterpolation').default));
        break;
      case 'default-parameters':
        require.ensure([], () => this.setFeature(require('./features/syntax/DefaultParameters').default));
        break;
      case 'destructuring-and-await':
        require.ensure([], () => this.setFeature(require('./features/syntax/DestructuringAndAwait').default));
        break;
      case 'file-env-variables':
        require.ensure([], () => this.setFeature(require('./features/env/FileEnvVariables').default));
        break;
      case 'generators':
        require.ensure([], () => this.setFeature(require('./features/syntax/Generators').default));
        break;
      case 'image-inclusion':
        require.ensure([], () => this.setFeature(require('./features/webpack/ImageInclusion').default));
        break;
      case 'json-inclusion':
        require.ensure([], () => this.setFeature(require('./features/webpack/JsonInclusion').default));
        break;
      case 'node-path':
        require.ensure([], () => this.setFeature(require('./features/env/NodePath').default));
        break;
      case 'no-ext-inclusion':
        require.ensure([], () => this.setFeature(require('./features/webpack/NoExtInclusion').default));
        break;
      case 'object-destructuring':
        require.ensure([], () => this.setFeature(require('./features/syntax/ObjectDestructuring').default));
        break;
      case 'object-spread':
        require.ensure([], () => this.setFeature(require('./features/syntax/ObjectSpread').default));
        break;
      case 'promises':
        require.ensure([], () => this.setFeature(require('./features/syntax/Promises').default));
        break;
      case 'rest-and-default':
        require.ensure([], () => this.setFeature(require('./features/syntax/RestAndDefault').default));
        break;
      case 'rest-parameters':
        require.ensure([], () => this.setFeature(require('./features/syntax/RestParameters').default));
        break;
      case 'shell-env-variables':
        require.ensure([], () => this.setFeature(require('./features/env/ShellEnvVariables').default));
        break;
      case 'svg-inclusion':
        require.ensure([], () => this.setFeature(require('./features/webpack/SvgInclusion').default));
        break;
      case 'template-interpolation':
        require.ensure([], () => this.setFeature(require('./features/syntax/TemplateInterpolation').default));
        break;
      case 'unknown-ext-inclusion':
        require.ensure([], () => this.setFeature(require('./features/webpack/UnknownExtInclusion').default));
        break;
      default:
        this.setFeature(null);
        break;
    }
  }

  setFeature(feature) {
    this.setState({ feature });
  }

  render() {
    const Feature = this.state.feature;
    return Feature ? <BuiltEmitter><Feature /></BuiltEmitter> : null;
  }
}

export default App;
