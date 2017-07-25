import React from 'react';

import Icon from './icon';

import logo from '../images/sprite/logo.svg';

const Header = () => (
  <header>
    <Icon glyph={logo.id} />
  </header>
);

export default Header;
