/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import styles from './assets/scss-styles.module.scss';
import indexStyles from './assets/index.module.scss';

export default () => (
  <div>
    <p className={styles.scssModulesInclusion}>SCSS Modules are working!</p>
    <p className={indexStyles.scssModulesIndexInclusion}>
      SCSS Modules with index are working!
    </p>
  </div>
);
