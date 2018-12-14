import React from 'react';
import { func, node, oneOfType } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

import Code, { CodeBlock } from './../../components/Code';

import { H1, H2, H3, H4, H5, P, Link } from './../../components/Typography';

import { MDXProvider } from '@mdx-js/tag';

const components = {
  h1: props => <H1 {...props} />,
  h2: props => <H2 {...props} />,
  h3: props => <H3 {...props} />,
  h4: props => <H4 {...props} />,
  h5: props => <H5 {...props} />,
  p: props => <P {...props} />,
  a: props => <Link {...props} />,
  inlineCode: props => <Code {...props} />,
  code: props => <CodeBlock {...props} />
};

const propTypes = {
  render: oneOfType([node, func])
};

const CLASS_ROOT = '';

const Page = ({ className, render, ...other }) => {
  const classes = cx(CLASS_ROOT, className);

  const Render = render;

  return (
    <StyledPage className={classes} {...other}>
      <MDXProvider components={components}>
        {typeof render === 'function' ? <Render /> : render}
      </MDXProvider>
    </StyledPage>
  );
};

Page.displayName = 'Docs';
Page.propTypes = propTypes;

const StyledPage = styled.div`
  padding: 0 ${props => props.theme.spaces.medium};
`;

export default Page;
