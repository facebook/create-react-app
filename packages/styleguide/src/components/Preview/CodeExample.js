import React from 'react';
import { object, arrayOf, oneOf } from 'prop-types';

import styled from 'styled-components';

import unescape from 'unescape-html';
import reactElementToJSXString from 'react-element-to-jsx-string';
import pretty from 'pretty';
import { renderToStaticMarkup } from 'react-dom/server';

import { CodeBlock } from '../Code/';

import { ButtonBaseCSS } from '../../style/common';

const getJSXAsStringFromMarkup = (markup, options) => {
  const reactElementToJSXStringOptions = {
    ...options,
    showFunctions: true,
    functionValue: () => ''
  };

  // valid element can be passed to reactElementToJSXString directly
  if (React.isValidElement(markup)) {
    return reactElementToJSXString(markup, reactElementToJSXStringOptions);
  }

  // if it's array, we need to pass elemenets one by one
  if (Array.isArray(markup)) {
    return markup
      .map(markupItem =>
        reactElementToJSXString(markupItem, reactElementToJSXStringOptions)
      )
      .join('\n');
  }

  return '';
};

export default class CodeExample extends React.Component {
  static displayName = 'CodeExample';

  static propTypes = {
    codeJSXOptions: object,
    codeTypes: arrayOf(oneOf(['jsx', 'html']))
  };

  static defaultProps = {
    codeTypes: ['jsx', 'html']
  };

  state = {
    codePreviewType: this.props.codeTypes && this.props.codeTypes[0]
  };

  handleCodePreviewTypeToggle(e, type) {
    this.setState({
      codePreviewType: type
    });
  }

  render() {
    const { children, codeJSXOptions, codeTypes, ...other } = this.props;

    let codeToShow;
    switch (this.state.codePreviewType) {
      case 'html':
        codeToShow = pretty(
          typeof children === 'string'
            ? unescape(children)
            : renderToStaticMarkup(children),
          {
            ocd: true
          }
        );
        break;
      case 'jsx':
        codeToShow = getJSXAsStringFromMarkup(children, codeJSXOptions);
        break;
      default:
        codeToShow = '';
    }

    return (
      <div {...other}>
        {codeTypes.map(codeType => (
          <StyledCodeTypeToggle
            key={codeType}
            role="button"
            onClick={e => this.handleCodePreviewTypeToggle(e, codeType)}
            className={this.state.codePreviewType === codeType && 'is-active'}
          >
            {codeType.toUpperCase()}
          </StyledCodeTypeToggle>
        ))}
        <CodeBlock language={this.state.codePreviewType}>
          {codeToShow}
        </CodeBlock>
      </div>
    );
  }
}

const StyledCodeTypeToggle = styled.button`
  ${ButtonBaseCSS};

  margin-bottom: 0;
  border-top-left-radius: ${props => props.theme.borderRadius.default};
  border-top-right-radius: ${props => props.theme.borderRadius.default};

  &:hover {
    background: ${props => props.theme.colors.grey};
  }

  &.is-active {
    background-color: ${props => props.theme.colors.black};
    color: ${props => props.theme.colors.white};
  }
`;
