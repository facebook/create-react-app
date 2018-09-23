import React, { Component } from 'react';
import { string, node, object, bool, arrayOf } from 'prop-types';
import cx from 'classnames';
import Select from 'react-select';
import styled, { withTheme } from 'styled-components';
import chroma from 'chroma-js';

import PreviewTitleBar from './PreviewTitleBar';
import CodeExample from './CodeExample';
import Frame from './Frame';

import Card from './../Card';
import Icon from './../Icon';

import { ButtonBaseCSS } from '../../style/common';

const CLASS_ROOT = '';

function getBackgroundsAsArray(previewBackgrounds, excludedColors = []) {
  return Object.keys(previewBackgrounds)
    .filter(colorName => !excludedColors.includes(colorName))
    .map(key => ({
      value: previewBackgrounds[key],
      label: key
    }));
}

class Preview extends Component {
  static displayName = 'Preview';

  static propTypes = {
    title: string,
    code: node,
    codeJSXOptions: object,
    bgTheme: string,
    bgThemeExcludedColors: arrayOf(string),
    hasCodePreview: bool,
    html: string,
    isIframe: bool,
    iframeHead: node,
    iframeScripts: string
  };

  static defaultProps = {
    bgTheme: 'white',
    bgThemeExcludedColors: [],
    hasCodePreview: true
  };

  componentWillReceiveProps(props) {
    if (
      this.state.previewBackground &&
      props.bgTheme !== this.state.previewBackground.label
    ) {
      this.setState({
        previewBackground: {
          label: props.bgTheme,
          value: props.theme.previewBackgrounds[props.bgTheme]
        }
      });
    }
  }

  constructor(props) {
    super(props);

    this.handleToggleCode = this.handleToggleCode.bind(this);
    this.handlePreviewBackground = this.handlePreviewBackground.bind(this);
  }

  state = {
    isCodeShown: false,
    previewBackground: this.props.theme.previewBackgrounds
      ? {
          label: this.props.bgTheme,
          value: this.props.theme.previewBackgrounds[this.props.bgTheme]
        }
      : {}
  };

  handleToggleCode() {
    this.setState({
      isCodeShown: !this.state.isCodeShown
    });
  }

  handlePreviewBackground = previewBackground => {
    this.setState({ previewBackground });
  };

  return;

  render() {
    const {
      children,
      className,
      title,
      code,
      codeJSXOptions,
      bgTheme,
      bgThemeExcludedColors,
      isIframe,
      iframeHead,
      iframeScripts,
      hasCodePreview,
      html,
      theme,
      ...other
    } = this.props;

    const { previewBackground } = this.state;

    const classes = cx(CLASS_ROOT, className);

    const colourStyles = {
      option: (styles, { data, isActive }) => {
        const color = chroma(data.value);
        return {
          ...styles,
          backgroundColor: isActive ? 'black' : data.value,
          color: chroma.contrast(color, 'white') > 2 ? 'white' : 'black',
          cursor: 'pointer'
        };
      },
      container: () => {},
      control: () => {},
      valueContainer: () => {},
      singleValue: () => {},
      indicatorSeparator: () => {}
    };

    const actions = [];

    if (bgTheme && theme.previewBackgrounds) {
      const bgColorsOptions = getBackgroundsAsArray(
        theme.previewBackgrounds,
        bgThemeExcludedColors
      );

      if (bgColorsOptions.length) {
        actions.push(
          <StyledSelect
            name="background-select"
            className="select-wrapper"
            classNamePrefix="select"
            isSearchable={false}
            isClearable={false}
            value={previewBackground}
            placeholder={previewBackground.value}
            onChange={this.handlePreviewBackground}
            options={bgColorsOptions}
            styles={colourStyles}
          />
        );
      }
    }

    if (hasCodePreview) {
      actions.push(
        <StyledButton onClick={this.handleToggleCode}>
          <Icon name="code" fill={theme.colors.accent} />
          {this.state.isCodeShown ? 'Hide code' : 'Show code'}
        </StyledButton>
      );
    }

    const childrenToRender =
      typeof children === 'function'
        ? children({
            bgTheme: previewBackground.label,
            bgThemeValue: previewBackground.value
          })
        : children;

    const toReneder = childrenToRender || (
      // eslint-disable-next-line react/no-danger
      <div dangerouslySetInnerHTML={{ __html: html }} />
    );

    const toCode = code || childrenToRender || html;

    const content = isIframe ? (
      <Frame head={iframeHead} scripts={iframeScripts}>
        {toReneder}
      </Frame>
    ) : (
      toReneder
    );

    return [
      <PreviewTitleBar title={title} actions={actions} key="previewTitle" />,
      <Card
        className={classes}
        bgColor={previewBackground.value}
        {...other}
        key="previewCard"
      >
        <StyledPreviewLive>{content}</StyledPreviewLive>
        {this.state.isCodeShown &&
          hasCodePreview &&
          toCode && (
            <CodeExample
              {...(html ? { codeTypes: ['html'] } : {})}
              codeJSXOptions={codeJSXOptions}
            >
              {toCode}
            </CodeExample>
          )}
      </Card>
    ];
  }
}

export default withTheme(Preview);

const StyledPreviewLive = styled.div`
  transition: all 200ms ease-in-out;
`;

const StyledButton = styled.button`
  ${ButtonBaseCSS};
  padding-right: 0;
  text-transform: uppercase;
`;

const StyledSelect = styled(Select)`
  &.select-wrapper {
    position: relative;
    font-family: ${props => props.theme.fontFamily};
    font-size: 14px;
  }

  .select__control {
    cursor: pointer;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    min-width: 130px;
  }

  .select__value-container {
    display: inline-flex;
    justify-content: flex-end;
  }

  .select__single-value,
  .select__option {
    text-transform: uppercase;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .select__menu {
    border-radius: 0 !important;
    text-align: center;
  }
`;
