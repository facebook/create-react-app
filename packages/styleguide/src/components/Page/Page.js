import React from 'react';
import { func, node, oneOfType } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import { components } from './../../utils/mdx';

const propTypes = {
  render: oneOfType([node, func])
};

const CLASS_ROOT = '';

const Page = ({ className, render, ...other }) => {
  const classes = cx(CLASS_ROOT, className);

  const Render = render;

  return (
    <StyledPage className={classes} {...other}>
      {typeof render === 'function' ? (
        <Render components={components} />
      ) : (
        render
      )}
    </StyledPage>
  );
};

Page.displayName = 'Docs';
Page.propTypes = propTypes;

const StyledPage = styled.div`
  padding: 0 ${props => props.theme.spaces.medium};
`;

export default Page;
