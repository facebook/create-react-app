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
    this.setFeatureFromString = this.setFeatureFromString.bind(this)
  }

  componentDidMount() {
    const feature = window.location.hash.slice(1);
    switch (feature) {
      case 'array-destructuring':
        setFeatureFromString('./features/syntax/ArrayDestructuring')
        break;
      case 'array-spread':
        setFeatureFromString('./features/syntax/ArraySpread')
        break;
      case 'async-await':
        setFeatureFromString('./features/syntax/AsyncAwait')
        break;
      case 'class-properties':
        setFeatureFromString('./features/syntax/ClassProperties')
        break;
      case 'computed-properties':
        setFeatureFromString('./features/syntax/ComputedProperties')
        break;
      case 'css-inclusion':
        setFeatureFromString('./features/webpack/CssInclusion')
        break;
      case 'custom-interpolation':
        setFeatureFromString('./features/syntax/CustomInterpolation')
        break;
      case 'default-parameters':
        setFeatureFromString('./features/syntax/DefaultParameters')
        break;
      case 'destructuring-and-await':
        setFeatureFromString('./features/syntax/DestructuringAndAwait')
        break;
      case 'file-env-variables':
        setFeatureFromString('./features/env/FileEnvVariables')
        break;
      case 'generators':
        setFeatureFromString('./features/syntax/Generators')
        break;
      case 'image-inclusion':
        setFeatureFromString('./features/webpack/ImageInclusion')
        break;
      case 'json-inclusion':
        setFeatureFromString('./features/webpack/JsonInclusion')
        break;
      case 'linked-modules':
        setFeatureFromString('./features/webpack/LinkedModules')
        break;
      case 'node-path':
        import('./features/env/NodePath').then(f => this.setFeature(f.default));
        break;
      case 'no-ext-inclusion':
        setFeatureFromString('./features/webpack/NoExtInclusion')
        break;
      case 'object-destructuring':
        setFeatureFromString('./features/syntax/ObjectDestructuring')
        break;
      case 'object-spread':
        setFeatureFromString('./features/syntax/ObjectSpread')
        break;
      case 'promises':
        setFeatureFromString('./features/syntax/Promises')
        break;
      case 'public-url':
        setFeatureFromString('./features/env/PublicUrl')
        break;
      case 'rest-and-default':
        setFeatureFromString('./features/syntax/RestAndDefault')
        break;
      case 'rest-parameters':
        setFeatureFromString('./features/syntax/RestParameters')
        break;
      case 'shell-env-variables':
        setFeatureFromString('./features/env/ShellEnvVariables')
        break;
      case 'svg-inclusion':
        setFeatureFromString('./features/webpack/SvgInclusion')
        break;
      case 'template-interpolation':
        setFeatureFromString('./features/syntax/TemplateInterpolation')
        break;
      case 'unknown-ext-inclusion':
        setFeatureFromString('./features/webpack/UnknownExtInclusion')
        break;
      case 'expand-env-variables':
        setFeatureFromString('./features/env/ExpandEnvVariables')
        break;
      default:
        throw new Error(`Missing feature "${feature}"`);
    }
  }
  
  setFeatureFromString(featureString) {
    import(featureString).then(f =>
      this.setFeature(f.default)
    );
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
