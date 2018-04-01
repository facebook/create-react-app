import React from 'react';
import {} from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

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
  background-color: ${props => props.theme.colors.white};
`;

Sidebar.displayName = 'Sidebar';
Sidebar.propTypes = propTypes;

export default Sidebar;
