import React, { useState, useEffect } from 'react';
import { array, bool, func } from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';

import { withRouter, useLocation } from 'react-router-dom';

import { rem } from './../../style/utils';
import Category from './Category';
import NavLink from './NavLink';

const CLASS_ROOT = 'sg-nav';

const Navigation = ({
  className,
  routes = [],
  isMain,
  onNavLinkClick,
  ...other
}) => {
  const classes = cx(CLASS_ROOT, className);
  let location = useLocation();

  const [activeCategories, setActiveCategories] = useState({});

  /**
   * Set category active state
   */
  const setCategoryActiveState = (id, value = true) => {
    setActiveCategories({
      ...activeCategories,
      [id]: value,
    });
  };

  /**
   * This method sets every category state (from pathname)
   * from first parent to current category to active
   */
  const setActiveCategoriesFromPathname = () => {
    let url = '';
    const locPath = location.pathname;
    const categories = locPath
      // remove first '/' and last item of the path
      .substring(1, locPath.lastIndexOf('/'))
      .split('/')
      .reduce((acc, curr) => {
        url += '/' + curr;
        return { ...acc, [url]: true };
      }, {});

    // set all new active categories
    setActiveCategories({ ...activeCategories, ...categories });
  };

  useEffect(
    () => {
      setActiveCategoriesFromPathname();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname]
  );

  const getNavList = (nodes = [], path = '') => (
    <StyledNavList isMain={path === ''}>
      {nodes.map(node => {
        let item = null;
        let nestedList = null;

        const url = path + node.path;
        if (node.nodes) {
          item = (
            <Category
              onClick={() => {
                setCategoryActiveState(url, !activeCategories[url]);
              }}
              isActive={activeCategories[url]}
            >
              {node.title}
            </Category>
          );

          nestedList = getNavList(node.nodes, url);
        } else {
          item = (
            <NavLink href={url} onClick={onNavLinkClick}>
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
};

Navigation.displayName = 'Navigation';

Navigation.propTypes = {
  isMain: bool,
  routes: array,
  onNavLinkClick: func,
};

const StyledNav = styled.nav`
  width: ${props => rem(props.theme.sizes.menuWidth)};
  box-sizing: content-box;
  font-family: ${props => props.theme.fontFamily};
  font-size: ${props => rem(props.theme.fontSizes.base)};
  line-height: ${props => props.theme.lineHeights.base};
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
  margin: 0 0 0 ${props => rem(props.theme.spaces.small)};
`;

export default withRouter(
  ({ location, match, history, staticContext, ...other }) => (
    <Navigation {...other} />
  )
);
