import React, { Component } from 'react';
import { string, node, object, bool, oneOf } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

import PreviewTitleBar from './PreviewTitleBar';
import CodeExample from './CodeExample';
import Frame from './Frame';

import Card from './../Card';
import Icon from './../Icon';

import { colors } from './../../style/theme';
import { ButtonBaseCSS } from '../../style/common';

const CLASS_ROOT = '';

export default class Preview extends Component {
  static displayName = 'Preview';

  static propTypes = {
    title: string,
    code: node,
    codeJSXOptions: object,
    bgTheme: oneOf(['white', 'grey', 'black']),
    hasCodePreview: bool,
    html: string,
    isIframe: bool,
    iframeHead: node,
    iframeScripts: string
  };

  static defaultProps = {
    bgTheme: 'white',
    hasCodePreview: true
  };

  constructor(props) {
    super(props);

    this.handleToggleCode = this.handleToggleCode.bind(this);
  }

  state = {
    isCodeShown: false
  };

  handleToggleCode() {
    this.setState({
      isCodeShown: !this.state.isCodeShown
    });
  }

  render() {
    const {
      children,
      className,
      title,
      code,
      codeJSXOptions,
      bgTheme,
      isIframe,
      iframeHead,
      iframeScripts,
      hasCodePreview,
      html,
      ...other
    } = this.props;

    const classes = cx(CLASS_ROOT, className);

    const actions = [];

    if (hasCodePreview) {
      actions.push(
        <StyledButton onClick={this.handleToggleCode}>
          <Icon name="code" fill={colors.orange} />
          {this.state.isCodeShown ? 'Hide code' : 'Show code'}
        </StyledButton>
      );
    }

    const toReneder = children || (
      // eslint-disable-next-line react/no-danger
      <div dangerouslySetInnerHTML={{ __html: html }} />
    );

    const toCode = code || children || html;

    const content = isIframe ? (
      <Frame head={iframeHead} scripts={iframeScripts}>
        {toReneder}
      </Frame>
    ) : (
      toReneder
    );

    return [
      <PreviewTitleBar title={title} actions={actions} key="previewTitle" />,
      <Card className={classes} {...other} key="previewCard">
        <StyledPreviewLive bgTheme={bgTheme}>{content}</StyledPreviewLive>
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

const StyledPreviewLive = styled.div`
  background-color: ${props => props.theme.colors[props.bgTheme]};
`;

const StyledButton = styled.button`
  ${ButtonBaseCSS};
  padding-right: 0;
  text-transform: uppercase;
`;
