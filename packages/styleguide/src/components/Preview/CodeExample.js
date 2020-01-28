import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { object, arrayOf, oneOf } from 'prop-types';

import unescape from 'unescape-html';
import reactElementToJSXString from 'react-element-to-jsx-string';
import pretty from 'pretty';
import { renderToStaticMarkup } from 'react-dom/server';

import Code from '../Code/';
import Button from '../Button';

import * as theme from '../../style/theme';

/**
 * Remove props that are undefined or null
 * Don't show React.Fragment in code example
 */
const cleanUpCode = markup => {
  const markupProps = markup.props || {};

  return Object.keys(markupProps).reduce((acc, curr) => {
    let currProp = markupProps[curr];

    let newProp;
    // clean up child code
    if (curr === 'children' && typeof currProp !== 'string') {
      newProp = React.Children.map(currProp, child => {
        // hide fragments if containing just strings
        const isFragmentString =
          child.type === React.Fragment &&
          child.props &&
          typeof child.props.children === 'string';

        return isFragmentString
          ? child.props.children
          : {
              ...child,
              props: cleanUpCode(child),
            };
      });
    }

    // hide undefined or null props
    const isNotDefined = [undefined, null].indexOf(currProp) !== -1;
    return {
      ...acc,
      ...(isNotDefined
        ? {}
        : {
            [curr]: newProp || currProp,
          }),
    };
  }, {});
};

const getJSXAsStringFromMarkup = (markup, options) => {
  const { cleanProps, filterProps = [], ...otherOptions } = options || {};

  const reactElementToJSXStringOptions = {
    showDefaultProps: false,
    showFunctions: true,
    functionValue: fn => fn.name,
    displayName: ReactElement => ReactElement.props.mdxType,
    filterProps: ['mdxType', 'originalType', ...filterProps],
    ...otherOptions,
  };

  if (cleanProps) {
    markup = {
      ...markup,
      props: cleanUpCode(markup),
    };
  }

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

  // if it's pure text, return it
  if (typeof markup === 'string') {
    return markup;
  }

  return '';
};

export default class CodeExample extends React.Component {
  static displayName = 'CodeExample';

  static propTypes = {
    codeJSXOptions: object,
    codeTypes: arrayOf(oneOf(['jsx', 'html'])),
  };

  static defaultProps = {
    codeTypes: ['jsx', 'html'],
  };

  state = {
    codePreviewType: this.props.codeTypes && this.props.codeTypes[0],
    copyButtonText: 'Copy to clipboard',
    copyButtonClass: '',
  };

  constructor(props) {
    super(props);

    this.codeBlockRef = React.createRef();
  }

  handleCodePreviewTypeToggle(e, type) {
    this.setState({
      codePreviewType: type,
    });
  }

  handleCopyCode(e, element) {
    const selection = window.getSelection();
    const range = document.createRange();
    const elem = ReactDOM.findDOMNode(element);
    range.selectNodeContents(elem);
    selection.removeAllRanges();
    selection.addRange(range);

    let newText = 'Copied!';
    let newClass = 'success';

    try {
      document.execCommand('copy');
      // selection.removeAllRanges();
    } catch (e) {
      newText = 'Error! Press Ctrl + C';
      newClass = 'error';
    }

    const {
      copyButtonText: originalText,
      copyButtonClass: originalClass,
    } = this.state;

    this.setState(
      {
        copyButtonText: newText,
        copyButtonClass: newClass,
      },
      () => {
        setTimeout(() => {
          this.setState({
            copyButtonText: originalText,
            copyButtonClass: originalClass,
          });
        }, 1200);
      }
    );
  }

  render() {
    const { children, codeJSXOptions, codeTypes, ...other } = this.props;

    let codeToShow;
    switch (this.state.codePreviewType) {
      case 'html':
        codeToShow = pretty(
          typeof children === 'string'
            ? unescape(children)
            : renderToStaticMarkup({
                ...children,
                props: { ...children.props, theme },
              }),
          {
            ocd: true,
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
      <StyledWrapper {...other}>
        {codeTypes.map(codeType => (
          <StyledCodeTypeToggle
            key={codeType}
            role="button"
            onClick={e => this.handleCodePreviewTypeToggle(e, codeType)}
            className={
              this.state.codePreviewType === codeType ? 'is-active' : ''
            }
          >
            {codeType.toUpperCase()}
          </StyledCodeTypeToggle>
        ))}
        <StyledCopyButton
          className={this.state.copyButtonClass}
          onClick={e => this.handleCopyCode(e, this.codeBlockRef.current)}
        >
          {this.state.copyButtonText}
        </StyledCopyButton>
        <Code
          inline={false}
          ref={this.codeBlockRef}
          language={
            this.state.codePreviewType === 'html'
              ? 'markup'
              : this.state.codePreviewType
          }
        >
          {codeToShow}
        </Code>
      </StyledWrapper>
    );
  }
}

const StyledCopyButton = styled(Button)`
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translateY(100%);
  margin-bottom: 0;

  background: ${props => props.theme.colors.white};

  &:hover {
    background: ${props => props.theme.colors.grey};
  }

  &.success {
    background: ${props => props.theme.colors.success};
  }

  &.error {
    background: ${props => props.theme.colors.error};
  }
`;

StyledCopyButton.defaultProps = {
  theme,
};

const StyledWrapper = styled.div`
  position: relative;
`;

const StyledCodeTypeToggle = styled(Button)`
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

StyledCodeTypeToggle.defaultProps = {
  theme,
};
