import React from 'react';
import { node } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

const propTypes = {
  render: node
};

const CLASS_ROOT = '';

const Page = ({ className, render, ...other }) => {
  const classes = cx(CLASS_ROOT, className);

  return (
    <StyledPage className={classes} {...other}>
      {render}
    </StyledPage>
  );
};

Page.displayName = 'Docs';
Page.propTypes = propTypes;

const StyledPage = styled.div`
  padding: 0 ${props => props.theme.spaces.medium};
`;

export default Page;
