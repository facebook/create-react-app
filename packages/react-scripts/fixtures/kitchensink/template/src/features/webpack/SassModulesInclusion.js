/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import styles from './assets/sass-styles.module.sass';
import indexStyles from './assets/index.module.sass';

export default () => (
  <div>
    <p className={styles.sassModulesInclusion}>SASS Modules are working!</p>
    <p className={indexStyles.sassModulesIndexInclusion}>
      SASS Modules with index are working!
    </p>
  </div>
);
