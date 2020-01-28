import React, { useState } from 'react';
import {
  string,
  node,
  object,
  bool,
  func,
  arrayOf,
  oneOfType,
} from 'prop-types';
import cx from 'classnames';
import Select from 'react-select';
import styled from 'styled-components';
import chroma from 'chroma-js';
import ReactGA from 'react-ga';

import * as theme from './../../style/theme';

import PreviewTitleBar from './PreviewTitleBar';
import CodeExample from './CodeExample';
import Frame from './Frame';
import Interact from './Interact/Interact';

import Card from './../Card';
import Icon from './../Icon';

import Button from './../Button';

const CLASS_ROOT = '';

const getBackgroundsAsArray = (previewBackgrounds, excludedColors = []) =>
  Object.keys(previewBackgrounds).reduce(
    (acc, name) => [
      ...acc,
      !excludedColors.includes(name)
        ? {
            value: previewBackgrounds[name],
            label: name,
          }
        : {},
    ],
    []
  );

const Preview = ({
  bgTheme,
  bgThemeColors,
  bgThemeExcludedColors,
  children,
  className,
  code,
  codeJSXOptions,
  enableFullscreen,
  hasCodePreview,
  html,
  iframeHead,
  iframeScripts,
  interactiveProps,
  isIframe,
  isInteractive,
  ...other
}) => {
  const [isCodeShown, setIsCodeShown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInteract, setShowInteract] = useState(false);
  const [previewBackground, setPreviewBackground] = useState(
    bgThemeColors
      ? {
          label: bgTheme,
          value: bgThemeColors[bgTheme],
        }
      : {}
  );

  function handleToggleCode() {
    setIsCodeShown(!isCodeShown);

    ReactGA.event({
      category: 'Preview',
      action: 'toggleCode',
    });
  }

  function handleToggleInteract() {
    setShowInteract(!showInteract);

    ReactGA.event({
      category: 'Preview',
      action: 'toggleInteract',
    });
  }

  function handlePreviewBackground(previewBackground) {
    setPreviewBackground(previewBackground);

    ReactGA.event({
      category: 'Preview',
      action: 'changeBackground',
      label: previewBackground.label,
    });
  }

  function handleToggleFullscreen() {
    setIsFullscreen(!isFullscreen);

    ReactGA.event({
      category: 'Preview',
      action: 'toggleFullscreen',
    });
  }

  const classes = cx(CLASS_ROOT, className);
  const wrapperClasses = cx('preview-wrapper', {
    'is-fullscreen': isFullscreen,
  });

  const colourStyles = {
    option: (styles, { data, isActive }) => {
      const color = chroma(data.value);
      return {
        ...styles,
        backgroundColor: isActive ? 'black' : data.value,
        color: chroma.contrast(color, 'white') > 2 ? 'white' : 'black',
        cursor: 'pointer',
      };
    },
    container: () => {},
    control: () => {},
    valueContainer: () => {},
    singleValue: () => {},
    indicatorSeparator: () => {},
  };

  const actions = [];

  if (bgTheme && bgThemeColors) {
    const bgColorsOptions = getBackgroundsAsArray(
      bgThemeColors,
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
          onChange={handlePreviewBackground}
          options={bgColorsOptions}
          styles={colourStyles}
        />
      );
    }
  }

  // TODO zjednotit
  if (hasCodePreview) {
    actions.push(
      <Button onClick={handleToggleCode}>
        <Icon name="code" fill={bgThemeColors.accent || '#000'} />
        {isCodeShown ? 'HIDE CODE' : 'SHOW CODE'}
      </Button>
    );
  }

  if (isInteractive) {
    actions.push(
      <Button onClick={handleToggleInteract}>
        <Icon name="code" fill={bgThemeColors.accent || '#000'} />
        {showInteract ? 'HIDE INTERACTIVE' : 'SHOW INTERACTIVE'}
      </Button>
    );
  }

  if (enableFullscreen) {
    actions.push(
      <Button onClick={handleToggleFullscreen}>
        <Icon name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'} />
        {isFullscreen ? 'MINIMIZE' : 'FULLSCREEN'}
      </Button>
    );
  }

  const renderAsFunctionContext = {
    bgTheme: previewBackground.label,
    bgThemeValue: previewBackground.value,
  };

  const childrenToRender =
    typeof children === 'function'
      ? children(renderAsFunctionContext)
      : children;

  const toRender = childrenToRender || (
    // eslint-disable-next-line react/no-danger
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );

  const toCode =
    (code && typeof code === 'function'
      ? code(renderAsFunctionContext)
      : code) ||
    childrenToRender ||
    html;

  const content = isIframe ? (
    <Frame head={iframeHead} scripts={iframeScripts}>
      {toRender}
    </Frame>
  ) : (
    toRender
  );

  return (
    <StyledPreview className={wrapperClasses}>
      <PreviewTitleBar actions={actions} />
      <StyledCard
        className={classes}
        bgColor={previewBackground.value}
        {...other}
      >
        {showInteract ? (
          React.Children.map(children, child => (
            <Interact
              showCode={isCodeShown}
              render={child}
              {...interactiveProps}
            />
          ))
        ) : (
          <>
            <StyledPreviewLive>{content}</StyledPreviewLive>
            {isCodeShown && hasCodePreview && toCode && (
              <CodeExample
                {...(html ? { codeTypes: ['html'] } : {})}
                codeJSXOptions={codeJSXOptions}
              >
                {toCode}
              </CodeExample>
            )}
          </>
        )}
      </StyledCard>
    </StyledPreview>
  );
};

Preview.displayName = 'Preview';

Preview.propTypes = {
  /** Default background color as color name. Must be one from passed `bgThemeColors`. To disable background color chooser, pass `false`. */
  bgTheme: oneOfType([string, bool]),
  /** Available background colors. Colors are inherithed from `theme.previewBackgrounds`. */
  bgThemeColors: object,
  /** Exclude colors from available background colors. */
  bgThemeExcludedColors: arrayOf(string),
  /** Pass custom code (JSX) which will be shown instead of visually previewed code. */
  code: oneOfType([node, func]),
  /** Pass [react-element-to-jsx-string](https://github.com/algolia/react-element-to-jsx-string) options to code preview. */
  codeJSXOptions: object,
  /** Enable fullscreen toggle */
  enableFullscreen: bool,
  /** Disables code preview. */
  hasCodePreview: bool,
  /** Pass HTML as string to preview HTML code. */
  html: string,
  /** (unstable) Iframe custom <head /> */
  iframeHead: node,
  /** (unstable) Iframe custom JavaScripts. */
  iframeScripts: string,
  /** Props for interactive component */
  interactiveProps: object,
  /** (unstable) Display preview in inframe. */
  isIframe: bool,
  /** Preview with interactivity */
  isInteractive: bool,
};

Preview.defaultProps = {
  bgTheme: 'white',
  bgThemeColors: { white: '#fff' },
  bgThemeExcludedColors: [],
  enableFullscreen: true,
  hasCodePreview: true,
  interactiveProps: {},
  isInteractive: true,
};

export default Preview;

const StyledPreviewLive = styled.div`
  transition: all 200ms ease-in-out;
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

StyledSelect.defaultProps = {
  theme,
};

const StyledPreview = styled.div`
  display: flex;
  flex-flow: column;

  &.is-fullscreen {
    background-color: white;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: ${props => props.theme.zIndex.fullScreenPreview};
  }
`;

StyledPreview.defaultProps = {
  theme,
};

const StyledCard = styled(Card)`
  .is-fullscreen & {
    flex: 1 1 auto;
    margin-bottom: 0;
    padding: 0;
  }
`;
