import React, { Component } from 'react';
import { string, array, element, func, oneOfType } from 'prop-types';
import styled from 'styled-components';

import { DocsTable } from './../Table';
import Card from './../Card';
import { H3 } from './../Typography';
import { Bar, BarItem } from '../Bar';
import InfoBadge from '../Badge/InfoBadge';

import { getTableData, sortTableData, excludeProps } from './utils';

function getComponentInfoFromComponent(component = {}) {
  return component.__docgenInfo && [component.__docgenInfo];
}

class ComponentDocs extends Component {
  static displayName = 'ComponentDocs';

  static propTypes = {
    /** Show props of passed React component with `__docgenInfo` property (eg. component was processed with [babel-plugin-react-docgen](https://github.com/storybooks/babel-plugin-react-docgen)). */
    component: oneOfType([element, func]),
    /** Component title. If component has `displayName set, title will be computed automatically. */
    title: string,
    /** Array of props which should be excluded from props table. */
    excludes: array,
  };

  static defaultProps = {
    excludes: [],
  };

  state = {
    info: [],
  };

  render() {
    const data = sortTableData(
      excludeProps(
        this.props.excludes,
        getTableData(getComponentInfoFromComponent(this.props.component))
      )
    );

    let title = this.props.title;

    if (!title && this.props.component) {
      title = `<${this.props.component.displayName} />`;
    }

    if (!title) {
      title = '⚠️ Missing title.';
    }

    if (data.length === 0) {
      return [
        <StyledTitle key="ComponentDocs-name">{this.props.title}</StyledTitle>,
        <p key="EmptyObjectText">
          This component does not have any prop types
        </p>,
      ];
    }
    return (
      <StyledComponentDocs>
        <StyledHeader>
          <Bar>
            <BarItem>
              <StyledTitle key="ComponentDocs-name">{title}</StyledTitle>
            </BarItem>
            {this.props.renderingScope && (
              <BarItem>
                <InfoBadge value={this.props.renderingScope} />
              </BarItem>
            )}
          </Bar>
        </StyledHeader>
        <StyledDocsTable data={data} hasOutsideBorder={false} />
      </StyledComponentDocs>
    );
  }
}

const StyledComponentDocs = styled(Card)`
  padding: 0;
`;

const StyledHeader = styled.header`
  padding-top: ${props => props.theme.spaces.medium};
  padding-left: ${props => props.theme.spaces.medium};
  padding-right: ${props => props.theme.spaces.medium};
`;

const StyledDocsTable = styled(DocsTable)`
  margin-bottom: 0;
  th,
  td {
    font-family: ${props => props.theme.fontFamily};
    font-size: ${props => props.theme.fontSizes.small};
  }

  td > div > *:last-child {
    margin-bottom: 0;
  }
`;

const StyledTitle = H3.withComponent('div');

export default ComponentDocs;
