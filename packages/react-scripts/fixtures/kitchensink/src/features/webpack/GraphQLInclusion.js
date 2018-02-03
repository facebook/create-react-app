/**
 * Copyright (c) 2018-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import A from './assets/graphql.graphql';

export default () => (
  <p id="graphql-inclusion">
    <span>{JSON.stringify(A)}</span>
  </p>
);
