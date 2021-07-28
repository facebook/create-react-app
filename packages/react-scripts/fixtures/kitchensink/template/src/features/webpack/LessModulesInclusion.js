/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import styles from './assets/less-styles.module.less';
import indexStyles from './assets/index.module.less';

const LessModulesInclusion = () => (
  <div>
    <p className={styles.lessModulesInclusion}>LESS Modules are working!</p>
    <p className={indexStyles.lessModulesIndexInclusion}>
      LESS Modules with index are working!
    </p>
  </div>
);

export default LessModulesInclusion;
