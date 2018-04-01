import React from 'react';

import Code from './Code';

export const CodeBlock = props => <Code inline={false} {...props} />;
CodeBlock.displayName = 'CodeBlock';

export const CodeBlockJSX = props => (
  <Code inline={false} language="jsx" {...props} />
);
CodeBlockJSX.displayName = 'CodeBlockJSX';

export const CodeJSX = props => <Code language="jsx" {...props} />;
CodeJSX.displayName = 'CodeJSX';

export default Code;
