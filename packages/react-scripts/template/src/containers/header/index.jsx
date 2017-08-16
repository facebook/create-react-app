// @flow

import React from 'react';

import styles from './index.css';


/** Define prop types using flow as a demo. */
type Props = {
  logo: string,
}

const Header = ({ logo }: Props) =>
  (<div>
    <div className={styles.header}>
      <img src={logo} className={styles.appLogo} alt="logo" />
      <h2>Welcome to React</h2>
    </div>
  </div>);

export default Header;
