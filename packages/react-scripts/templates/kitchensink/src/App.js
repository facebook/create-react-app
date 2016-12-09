import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = { feature: null };
  }

  componentDidMount() {
    switch (location.hash.slice(1)) {
      case 'array-destructuring':
        require.ensure(['./features/syntax/ArrayDestructuring'], () =>
          this.setState({ feature: require('./features/syntax/ArrayDestructuring').default })
        );
        break;
      case 'array-spread':
        require.ensure(['./features/syntax/ArraySpread'], () =>
          this.setState({ feature: require('./features/syntax/ArraySpread').default })
        );
        break;
      case 'async-await':
        require.ensure(['./features/syntax/AsyncAwait'], () =>
          this.setState({ feature: require('./features/syntax/AsyncAwait').default })
        );
        break;
      case 'class-properties':
        require.ensure(['./features/syntax/ClassProperties'], () =>
          this.setState({ feature: require('./features/syntax/ClassProperties').default })
        );
        break;
      case 'computed-properties':
        require.ensure(['./features/syntax/ComputedProperties'], () =>
          this.setState({ feature: require('./features/syntax/ComputedProperties').default })
        );
        break;
      case 'custom-interpolation':
        require.ensure(['./features/syntax/CustomInterpolation'], () =>
          this.setState({ feature: require('./features/syntax/CustomInterpolation').default })
        );
        break;
      case 'default-parameters':
        require.ensure(['./features/syntax/DefaultParameters'], () =>
          this.setState({ feature: require('./features/syntax/DefaultParameters').default })
        );
        break;
      case 'destructuring-and-await':
        require.ensure(['./features/syntax/DestructuringAndAwait'], () =>
          this.setState({ feature: require('./features/syntax/DestructuringAndAwait').default })
        );
        break;
      case 'file-env-variables':
        require.ensure(['./features/env/FileEnvVariables'], () =>
          this.setState({ feature: require('./features/env/FileEnvVariables').default })
        );
        break;
      case 'generators':
        require.ensure(['./features/syntax/Generators'], () =>
          this.setState({ feature: require('./features/syntax/Generators').default })
        );
        break;
      case 'node-path':
        require.ensure(['./features/env/NodePath'], () =>
          this.setState({ feature: require('./features/env/NodePath').default })
        );
        break;
      case 'object-destructuring':
        require.ensure(['./features/syntax/ObjectDestructuring'], () =>
          this.setState({ feature: require('./features/syntax/ObjectDestructuring').default })
        );
        break;
      case 'object-spread':
        require.ensure(['./features/syntax/ObjectSpread'], () =>
          this.setState({ feature: require('./features/syntax/ObjectSpread').default })
        );
        break;
      case 'promises':
        require.ensure(['./features/syntax/Promises'], () =>
          this.setState({ feature: require('./features/syntax/Promises').default })
        );
        break;
      case 'rest-and-default':
        require.ensure(['./features/syntax/RestAndDefault'], () =>
          this.setState({ feature: require('./features/syntax/RestAndDefault').default })
        );
        break;
      case 'rest-parameters':
        require.ensure(['./features/syntax/RestParameters'], () =>
          this.setState({ feature: require('./features/syntax/RestParameters').default })
        );
        break;
      case 'shell-env-variables':
        require.ensure(['./features/env/ShellEnvVariables'], () =>
          this.setState({ feature: require('./features/env/ShellEnvVariables').default })
        );
        break;
      case 'template-interpolation':
        require.ensure(['./features/syntax/TemplateInterpolation'], () =>
          this.setState({ feature: require('./features/syntax/TemplateInterpolation').default })
        );
        break;
      default:
        this.setState({ feature: null });
        break;
    }
  }

  render() {
    const Feature = this.state.feature;
    return Feature ? <Feature /> : null;
  }
}

export default App;
