import React from 'react';
import { array, bool, func, string } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

import { withRouter } from 'react-router-dom';

import { rem } from './../../style/utils';

import Category from './Category';
import NavLink from './NavLink';

const CLASS_ROOT = 'sg-nav';

class Navigation extends React.Component {
  static displayName = 'Navigation';

  static propTypes = {
    isMain: bool,
    routes: array,
    pathname: string,
    onNavLinkClick: func
  };

  constructor(props) {
    super(props);
    this.state = {
      activeLinks: []
    };
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillMount() {
    const path = this.props.pathname;

    let pathArray = [];
    pathArray = path.split('/');
    pathArray = pathArray.filter(e => String(e).trim());

    const activeLinks = this.copyActiveLinks(pathArray.length - 1);

    pathArray.forEach((element, i) => {
      activeLinks[i].push(`/${element}`);
    });

    this.setState({
      activeLinks
    });
  }

  handleClick(activeLink, depthLevel) {
    const activeLinks = this.copyActiveLinks(depthLevel);

    if (activeLinks[depthLevel].indexOf(activeLink) === -1) {
      activeLinks[depthLevel].push(activeLink);
    } else {
      activeLinks[depthLevel] = this.removeActive(
        activeLinks[depthLevel],
        activeLink
      );
    }

    this.setState({
      activeLinks
    });
  }

  // eslint-disable-next-line class-methods-use-this
  removeActive(arr, element) {
    return arr.filter(e => e !== element);
  }

  copyActiveLinks(depthLevel) {
    const activeLinks = this.state.activeLinks.slice(0);

    for (let i = 0; i <= depthLevel; i += 1) {
      activeLinks[i] = activeLinks[i] || [];
    }

    return activeLinks;
  }

  isActive(element, depthLevel) {
    const activeLinks = this.copyActiveLinks(depthLevel);

    return Array.isArray(activeLinks) || activeLinks.length
      ? activeLinks[depthLevel].includes(element)
      : false;
  }

  render() {
    const {
      className,
      routes = [],
      isMain,
      onNavLinkClick,
      ...other
    } = this.props;

    const classes = cx(CLASS_ROOT, className);

    const getNavList = (nodes = [], path = '', depthLevel = 0) => (
      <StyledNavList isMain={depthLevel === 0}>
        {nodes.map(node => {
          let item = null;
          let nestedList = null;

          if (node.nodes) {
            item = (
              <Category
                onClick={() => this.handleClick(node.path, depthLevel)}
                isActive={this.isActive(node.path, depthLevel)}
              >
                {node.title}
              </Category>
            );

            const depthLevelUpdated = depthLevel + 1;
            nestedList = getNavList(
              node.nodes,
              path + node.path,
              depthLevelUpdated
            );
          } else {
            item = (
              <NavLink href={path + node.path} onClick={onNavLinkClick}>
                {node.title}
              </NavLink>
            );
          }

          return (
            <ListItem key={path + node.path}>
              {item}
              {nestedList}
            </ListItem>
          );
        })}
      </StyledNavList>
    );

    // div has to wrapp Nav because of nice layout
    return (
      <StyledNav className={classes} {...other}>
        {getNavList(routes)}
      </StyledNav>
    );
  }
}

const StyledNav = styled.nav`
  width: ${props => rem(props.theme.sizes.menuWidth)};
  box-sizing: content-box;
  font-family: ${props => props.theme.fontFamily};
  font-size: ${props => rem(props.theme.fontSizes.base)};
  line-height: ${props => props.theme.lineHeights.base};

  padding: ${props => rem(props.theme.spaces.default)}
    ${props => rem(props.theme.spaces.medium)}
    ${props => rem(props.theme.spaces.medium)};
`;

const StyledNavList = styled.ul`
  max-height: ${props => (props.isMain ? '100%' : '0')};
  overflow: ${props => (props.isMain ? 'visible' : 'hidden')};
  padding: 0;
  box-shadow: ${props =>
    props.isMain ? 'none' : '-2px 0px 0px 0px rgba(0,0,0,0.1)'};
  list-style: none;
  font-weight: 700;
  transition: max-height 0.1s cubic-bezier(0, 1, 0.01, 0.98) 0s,
    padding 0.25s cubic-bezier(0, 1, 0.01, 0.98) 0s;
`;

const ListItem = styled.li`
  margin: 0 0 0 ${props => rem(props.theme.spaces.medium)};
`;

export default withRouter(
  ({ location, match, history, staticContext, ...other }) => (
    <Navigation pathname={location.pathname} {...other} />
  )
);
