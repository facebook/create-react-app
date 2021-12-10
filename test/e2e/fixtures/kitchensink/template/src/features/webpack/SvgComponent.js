/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { ReactComponent as Logo } from './assets/logo.svg';

const SvgComponent = () => {
  return <Logo id="feature-svg-component" />;
};

export const SvgComponentWithRef = React.forwardRef((props, ref) => (
  <Logo id="feature-svg-component-with-ref" ref={ref} />
));

export default SvgComponent;
