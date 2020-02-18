import React from 'react';
import { string, bool, oneOf, object } from 'prop-types';
import styled from 'styled-components';
import { stripUnit, em } from 'polished';
import Highlight, { defaultProps } from 'prism-react-renderer';

import oneDarkProTheme from './oneDarkProTheme';

import * as theme from './../../style/theme';
import { rem } from '../../style/utils';

const PreviewCode = ({
  children,
  language,
  inline,
  theme = oneDarkProTheme,
  ...other
}) => {
  if (!children) {
    return null;
  }

  const Tag = inline ? 'span' : 'div';

  return (
    <Highlight
      {...defaultProps}
      code={children}
      language={language}
      theme={theme}
    >
      {({ tokens, style, getLineProps, getTokenProps }) => {
        const highlight = tokens.map((line, i) => (
          <Tag {...getLineProps({ line, key: i })}>
            {line.map((token, key) => (
              <span {...getTokenProps({ token, key })} />
            ))}
          </Tag>
        ));

        return (
          <StyledHighlightWrapper
            inline={inline}
            as={inline ? 'span' : 'div'}
            style={style}
            {...other}
          >
            {inline ? (
              <code
                className={`code code--inline prism-code language-${language}`}
              >
                {highlight}
              </code>
            ) : (
              <StyledPre className={`language-${language}`}>
                <code className={`code prism-code language-${language}`}>
                  {highlight}
                </code>
              </StyledPre>
            )}
          </StyledHighlightWrapper>
        );
      }}
    </Highlight>
  );
};

PreviewCode.displayName = 'Code';

PreviewCode.propTypes = {
  /** Code to highlight. */
  children: string,
  /** Suppored languages. */
  language: oneOf([
    'markup',
    'javascript',
    'jsx',
    'css',
    'scss',
    'bash',
    'json',
    'diff',
  ]),
  /** Inline code preview with text. */
  inline: bool,
  /** Theme VSCode theme style object defined in https://github.com/FormidableLabs/prism-react-renderer#theming */
  theme: object,
};

PreviewCode.defaultProps = {
  children: '',
  inline: true,
  language: 'markup',
};

export default PreviewCode;

const StyledHighlightWrapper = styled.span`
  code {
    display: ${({ inline }) => (inline ? 'inline' : 'block')} !important;
  }

  code[class*='language-'] {
    font-feature-settings: 'calt' 1;
    text-rendering: optimizeLegibility;
    font-family: ${props => props.theme.codeFontFamily};
    font-size: ${props =>
      em(props.theme.fontSizes.small, props.theme.fontSizes.base)};
    line-height: ${props =>
      (stripUnit(props.theme.fontSizes.base) * props.theme.lineHeights.base) /
      stripUnit(props.theme.fontSizes.small)};
    white-space: pre-wrap;
    max-height: ${rem('300px')};
  }

  &:not(pre) code[class*='language-'] {
    padding: ${em(3.5)} ${em(5)};
    border-radius: 0;
  }

  .token.punctuation {
    color: #abb2bf;
  }
`;

StyledHighlightWrapper.defaultProps = {
  theme,
};

const StyledPre = styled.pre`
  pre[class*='language-']& {
    margin: 0 0 ${props => rem(props.theme.spaces.medium)};
  }
`;

StyledPre.defaultProps = {
  theme,
};
