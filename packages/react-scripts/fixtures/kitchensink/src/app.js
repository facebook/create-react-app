/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';

class BuiltEmitter extends Component {
  static propTypes = {
    feature: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { feature } = this.props;

    // Class components must call this.props.onReady when they're ready for the test.
    // We will assume functional components are ready immediately after mounting.
    if (!Component.isPrototypeOf(feature)) {
      this.handleReady();
    }
  }

  handleReady() {
    document.dispatchEvent(new Event('ReactFeatureDidMount'));
  }

  render() {
    const { props: { feature }, handleReady } = this;
    return (
      <div>
        {createElement(feature, {
          onReady: handleReady,
        })}
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { feature: null };

    this.setFeature = this.setFeature.bind(this);
  }

  componentDidMount() {
    const feature = window.location.hash.slice(1);
    switch (feature) {
      case 'array-destructuring':
        import('./features/syntax/array-destructuring').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'array-spread':
        import('./features/syntax/array-spread').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'async-await':
        import('./features/syntax/async-await').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'class-properties':
        import('./features/syntax/class-properties').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'computed-properties':
        import('./features/syntax/computed-properties').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'css-inclusion':
        import('./features/webpack/css-inclusion').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'custom-interpolation':
        import('./features/syntax/custom-interpolation').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'default-parameters':
        import('./features/syntax/default-parameters').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'destructuring-and-await':
        import('./features/syntax/destructuring-and-await').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'file-env-variables':
        import('./features/env/file-env-variables').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'generators':
        import('./features/syntax/generators').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'image-inclusion':
        import('./features/webpack/image-inclusion').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'json-inclusion':
        import('./features/webpack/json-inclusion').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'linked-modules':
        import('./features/webpack/linked-modules').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'node-path':
        import('./features/env/node-path').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'no-ext-inclusion':
        import('./features/webpack/no-ext-inclusion').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'object-destructuring':
        import('./features/syntax/object-destructuring').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'object-spread':
        import('./features/syntax/object-spread').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'promises':
        import('./features/syntax/promises').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'public-url':
        import('./features/env/public-url').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'rest-and-default':
        import('./features/syntax/rest-and-default').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'rest-parameters':
        import('./features/syntax/rest-parameters').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'shell-env-variables':
        import('./features/env/shell-env-variables').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'svg-inclusion':
        import('./features/webpack/svg-inclusion').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'template-interpolation':
        import('./features/syntax/template-interpolation').then(f =>
          this.setFeature(f.default)
        );
        break;
      case 'unknown-ext-inclusion':
        import('./features/webpack/unknown-ext-inclusion').then(f =>
          this.setFeature(f.default)
        );
        break;
      default:
        throw new Error(`Missing feature "${feature}"`);
    }
  }

  setFeature(feature) {
    this.setState({ feature });
  }

  render() {
    const { feature } = this.state;
    if (feature !== null) {
      return <BuiltEmitter feature={feature} />;
    }
    return null;
  }
}

export default App;
