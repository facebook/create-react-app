import React from 'react';
import { MDXProvider } from '@mdx-js/tag';

import Code, { CodeBlock } from './../components/Code';
import { H1, H2, H3, H4, H5, P, Link } from './../components/Typography';

/**
 * Create custom header id which can be used as hash in link
 * skips any react element in string and uses just strings
 * id contains only lowercase characters ("\w") numbers ("\d") and dashes ("-") for separation
 * Example: Hello 1 - anchor element, all you need
 * Turns into: hello-1-anchor-element-all-you-need
 */
const createHeaderId = props => {
  const childrenArr = React.Children.toArray(props.children);
  const text = childrenArr.reduce(
    (acc, cur) => (typeof cur === 'string' ? acc + cur : acc),
    ''
  );
  return `${text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\d]+/g, '-')}`;
};

export const components = {
  h1: props => <H1 id={`${createHeaderId(props)}`} {...props} />,
  h2: props => <H2 id={`${createHeaderId(props)}`} {...props} />,
  h3: props => <H3 id={`${createHeaderId(props)}`} {...props} />,
  h4: props => <H4 id={`${createHeaderId(props)}`} {...props} />,
  h5: props => <H5 id={`${createHeaderId(props)}`} {...props} />,
  // eslint-disable-next-line jsx-a11y/heading-has-content
  h6: props => <h6 id={`${createHeaderId(props)}`} {...props} />,
  p: props => <P {...props} />,
  a: props => <Link {...props} />,
  inlineCode: props => <Code {...props} />,
  code: props => <CodeBlock {...props} />
};

const MdxWrapper = props => <MDXProvider components={components} {...props} />;

export default MdxWrapper;
