import React from 'react';
import { func, node, oneOfType } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import MDXWrapper from '../MDX/';

import * as theme from './../../style/theme';

const propTypes = {
  /** Page content */
  render: oneOfType([node, func]).isRequired,
};

const CLASS_ROOT = '';

const Page = ({ className, render, ...other }) => {
  const classes = cx(CLASS_ROOT, className);

  const Render = render;

  return (
    <MDXWrapper>
      <StyledPage className={classes} {...other}>
        {typeof render === 'function' ? <Render /> : render}
      </StyledPage>
    </MDXWrapper>
  );
};

Page.displayName = 'Docs';
Page.propTypes = propTypes;

const StyledPage = styled.div`
  padding: 0 ${props => props.theme.spaces.medium};
`;

StyledPage.defaultProps = {
  theme,
};

export default Page;
