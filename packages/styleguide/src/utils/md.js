import React, { createElement } from 'react';
import md from 'react-markings';
import Code, { CodeBlock } from './../components/Code';

import { H1, H2, H3, H4, H5, P, Link } from './../components/Typography';

export default md.customize({
  renderers: {
    Paragraph: ({ children }) => <P>{children}</P>,
    // eslint-disable-next-line react/prop-types
    Code: ({ literal, language }) => <Code language={language}>{literal}</Code>,
    // eslint-disable-next-line react/prop-types
    CodeBlock: ({ literal, language }) => (
      <CodeBlock language={language}>{literal}</CodeBlock>
    ),
    // eslint-disable-next-line react/prop-types
    Heading: ({ level, children }) => {
      switch (level) {
        case 1:
          return <H1>{children}</H1>;
        case 2:
          return <H2>{children}</H2>;
        case 3:
          return <H3>{children}</H3>;
        case 4:
          return <H4>{children}</H4>;
        case 5:
          return <H5>{children}</H5>;
        default:
          return createElement(`h${level}`, null, children);
      }
    },
    Link: ({ href, title, children }) => (
      <Link href={href} title={title}>
        {children}
      </Link>
    )
  }
});
