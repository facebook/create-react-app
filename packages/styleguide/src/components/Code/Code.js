import React, { Component } from 'react';
import { string, bool } from 'prop-types';
import styled from 'styled-components';
import { stripUnit, em } from 'polished';

import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prism-theme-one-dark/prism-onedark.css';
import 'firacode/distr/fira_code.css';

import { rem } from '../../style/utils';

export default class PreviewCode extends Component {
  static displayName = 'PreviewCode';

  static propTypes = {
    children: string,
    language: string,
    inline: bool
  };

  static defaultProps = {
    children: '',
    inline: true,
    language: 'html'
  };

  state = {
    __html: Prism.highlight(
      this.props.children,
      Prism.languages[this.props.language]
    )
  };

  componentWillReceiveProps({ children, language }) {
    if (children !== this.props.children || language !== this.props.language) {
      this.setState({
        __html: Prism.highlight(children, Prism.languages[language])
      });
    }
  }

  render() {
    const { children, language, inline, ...other } = this.props;
    const { __html } = this.state;

    if (!children) {
      return null;
    }

    let highlight;

    if (!__html) {
      highlight = (
        <Highlight {...other} code={undefined} language={language}>
          {children}
        </Highlight>
      );
    } else {
      highlight = (
        <Highlight
          dangerouslySetInnerHTML={{ __html }}
          {...other}
          code={undefined}
          language={language}
        />
      );
    }

    return inline ? (
      highlight
    ) : (
      <StyledPre className={`prism-code language-${language}`}>
        {highlight}
      </StyledPre>
    );
  }
}

const Highlight = styled.code.attrs({
  className: props =>
    `code ${props.inline && 'code--inline'} language-${props.language}`
})`
  &[class*='language-'] {
    font-feature-settings: 'calt' 1;
    text-rendering: optimizeLegibility;

    font-family: 'Fira Code', monospace;
    font-size: ${props =>
      em(props.theme.fontSizes.small, props.theme.fontSizes.base)}
    line-height: ${props =>
      stripUnit(props.theme.fontSizes.base) *
      props.theme.lineHeights.base /
      stripUnit(props.theme.fontSizes.small)};
    white-space: pre-wrap;
    max-height: ${rem('300px')};
  }

  *:not(pre) > code&[class*='language-'] {
    padding: ${em(3.5)} ${em(5)};
    border-radius: ${props => props.theme.borderRadius.default};
    font-size: ${props =>
      em(props.theme.fontSizes.small, props.theme.fontSizes.base)}
  }
`;

const StyledPre = styled.pre`
  pre[class*='language-']& {
    margin: 0 0 ${props => rem(props.theme.spaces.medium)};
  }
`;
