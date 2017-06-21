/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
    const {
      props: { feature },
      handleReady,
    } = this;
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
        import(
          './features/syntax/ArrayDestructuring'
        ).then(f => this.setFeature(f.default));
        break;
      case 'array-spread':
        import('./features/syntax/ArraySpread').then(f =>
          this.setFeature(f.default));
        break;
      case 'async-await':
        import('./features/syntax/AsyncAwait').then(f =>
          this.setFeature(f.default));
        break;
      case 'class-properties':
        import('./features/syntax/ClassProperties').then(f =>
          this.setFeature(f.default));
        break;
      case 'computed-properties':
        import(
          './features/syntax/ComputedProperties'
        ).then(f => this.setFeature(f.default));
        break;
      case 'css-inclusion':
        import('./features/webpack/CssInclusion').then(f =>
          this.setFeature(f.default));
        break;
      case 'custom-interpolation':
        import(
          './features/syntax/CustomInterpolation'
        ).then(f => this.setFeature(f.default));
        break;
      case 'default-parameters':
        import('./features/syntax/DefaultParameters').then(f =>
          this.setFeature(f.default));
        break;
      case 'destructuring-and-await':
        import(
          './features/syntax/DestructuringAndAwait'
        ).then(f => this.setFeature(f.default));
        break;
      case 'file-env-variables':
        import('./features/env/FileEnvVariables').then(f =>
          this.setFeature(f.default));
        break;
      case 'generators':
        import('./features/syntax/Generators').then(f =>
          this.setFeature(f.default));
        break;
      case 'image-inclusion':
        import('./features/webpack/ImageInclusion').then(f =>
          this.setFeature(f.default));
        break;
      case 'json-inclusion':
        import('./features/webpack/JsonInclusion').then(f =>
          this.setFeature(f.default));
        break;
      case 'linked-modules':
        import('./features/webpack/LinkedModules').then(f =>
          this.setFeature(f.default));
        break;
      case 'node-path':
        import('./features/env/NodePath').then(f => this.setFeature(f.default));
        break;
      case 'no-ext-inclusion':
        import('./features/webpack/NoExtInclusion').then(f =>
          this.setFeature(f.default));
        break;
      case 'object-destructuring':
        import(
          './features/syntax/ObjectDestructuring'
        ).then(f => this.setFeature(f.default));
        break;
      case 'object-spread':
        import('./features/syntax/ObjectSpread').then(f =>
          this.setFeature(f.default));
        break;
      case 'promises':
        import('./features/syntax/Promises').then(f =>
          this.setFeature(f.default));
        break;
      case 'public-url':
        import('./features/env/PublicUrl').then(f =>
          this.setFeature(f.default));
        break;
      case 'rest-and-default':
        import('./features/syntax/RestAndDefault').then(f =>
          this.setFeature(f.default));
        break;
      case 'rest-parameters':
        import('./features/syntax/RestParameters').then(f =>
          this.setFeature(f.default));
        break;
      case 'shell-env-variables':
        import('./features/env/ShellEnvVariables').then(f =>
          this.setFeature(f.default));
        break;
      case 'svg-inclusion':
        import('./features/webpack/SvgInclusion').then(f =>
          this.setFeature(f.default));
        break;
      case 'template-interpolation':
        import(
          './features/syntax/TemplateInterpolation'
        ).then(f => this.setFeature(f.default));
        break;
      case 'unknown-ext-inclusion':
        import(
          './features/webpack/UnknownExtInclusion'
        ).then(f => this.setFeature(f.default));
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
