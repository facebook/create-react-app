import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';

import { rem } from './../../style/utils';
import * as theme from './../../style/theme';

const propTypes = {};

const CLASS_ROOT = 'sg-sidebar';

const Sidebar = ({ className, children, ...other }) => {
  const classes = cx(CLASS_ROOT, className);

  return (
    <StyledSidebar className={classes} {...other}>
      {children}
    </StyledSidebar>
  );
};

const StyledSidebar = styled.div`
  min-width: ${props => rem(props.theme.sizes.sidebarWidth)};
  position: fixed;
  top: 0;
  height: 100vh;
  padding: ${props => rem(props.theme.spaces.medium)};
  order: -1;
  overflow: auto;
  transform: translateX(-${props => rem(props.theme.sizes.sidebarWidth)});
  transition: transform 0.3s ease-in-out 0s;
  z-index: ${props => props.theme.zIndex.sidebar};
  background-color: ${props => props.theme.colors.main};
  display: flex;
  flex-direction: column;

  /* IE */
  @media all and (-ms-high-contrast: none) {
    left: 0;
  }

  @media (min-width: ${props => props.theme.breakpoints.l}) {
    position: sticky;
    transform: translateX(0);
  }

  .is-active & {
    transform: translateX(0);
  }
`;

StyledSidebar.defaultProps = {
  theme,
};

Sidebar.displayName = 'Sidebar';
Sidebar.propTypes = propTypes;

export default Sidebar;
