import React, { Component } from 'react';
import { string, array, oneOf, func } from 'prop-types';
import styled from 'styled-components';

import DocsTable from './../DocsTable';
import Card from './../Card';
import { H3 } from './../Typography';
import { Bar, BarItem } from '../Bar';
import InfoBadge from '../Badge/InfoBadge';

import {
  getComponentInfo,
  getTableData,
  sortTableData,
  excludeProps
} from './utils';

class ComponentDocs extends Component {
  static displayName = 'ComponentDocs';

  static propTypes = {
    path: string.isRequired,
    title: string.isRequired,
    excludes: array,
    renderingScope: oneOf(['universal', 'react', 'static']),
    resolver: func
  };

  static defaultProps = {
    excludes: [],
    resolver: () => {}
  };

  state = {
    info: []
  };

  async componentWillMount() {
    const { path } = this.props;
    let info;

    try {
      info = await getComponentInfo(path, this.props.resolver);
    } catch (e) {
      this.setState(() => ({ error: e }));
    }

    this.setState(() => ({
      info
    }));
  }

  render() {
    const data = sortTableData(
      excludeProps(this.props.excludes, getTableData(this.state.info))
    );

    if (data.length === 0) {
      return [
        <StyledTitle key="ComponentDocs-name">{this.props.title}</StyledTitle>,
        <p key="EmptyObjectText">This component does not have any prop types</p>
      ];
    }
    return (
      <StyledComponentDocs>
        <StyledHeader>
          <Bar>
            <BarItem>
              <StyledTitle key="ComponentDocs-name">
                {this.props.title}
              </StyledTitle>
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
