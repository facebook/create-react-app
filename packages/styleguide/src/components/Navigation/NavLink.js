import React from 'react';
import { bool, string } from 'prop-types';
import cx from 'classnames';
import { NavLink as Link } from 'react-router-dom';
import styled from 'styled-components';

import { rem, getColor } from './../../style/utils';

const propTypes = {
  href: string,
  isActive: bool
};

const CLASS_ROOT = 'sg-nav__link';
const activeClassName = `${CLASS_ROOT}--is-active`;

const NavLink = ({ className, href, isActive, children, ...other }) => {
  const classes = cx(CLASS_ROOT, className);

  return (
    <Link
      to={href}
      className={classes}
      exact
      activeClassName={activeClassName}
      {...other}
    >
      {children}
    </Link>
  );
};

NavLink.displayName = 'NavLink';
NavLink.propTypes = propTypes;

const StyledNavLink = styled(NavLink)`
  & {
    display: block;
    position: relative;
    padding: ${props => props.theme.nav.listTopBottomIndent} 0;
    outline: none !important; // TODO
    color: ${props => props.theme.colors.greyDark};
    font-weight: bold;
    z-index: 1;
    text-decoration: none;
  }
  &.${activeClassName} {
    color: ${props => props.theme.colors.accent};

    &:before {
      content: '';
      width: calc(100% + ${props => rem(props.theme.spaces.medium)});
      height: 100%;
      position: absolute;
      top: 0;
      left: -${props => rem(props.theme.spaces.medium)};
      background: ${props => getColor(props.theme.colors.accent, 50)};
      z-index: -1;
    }
  }
`;

export default StyledNavLink;
