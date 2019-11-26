import React, { Component, Fragment, Suspense } from 'react';
import { array, arrayOf, shape, string, node, object } from 'prop-types';
import { BrowserRouter } from 'react-router-dom';

import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

import * as theme from './../../style/theme';
import { rem } from './../../style/utils';

import { init, RouteTracker } from './../GoogleAnalytics';

import Header from './../Header';
import Sidebar from './../Sidebar';
import Navigation from './../Navigation';
import NavigationBar from './../NavigationBar';
import Sitemap from './../Sitemap';
import Search from './../Search';

class App extends Component {
  static displayName = 'App';

  static propTypes = {
    /** Styleguide config */
    config: shape({
      /** Current version of your styleguide */
      version: string,
      /** Project logo (desktop) */
      logo: node,
      /** Project logo (mobile) */
      logoSmall: node,
      /** Name of styleguide */
      name: string,
      /** Project theme which overrides or complements theme */
      theme: object,
      /** Base URL of this SPA */
      styleguideBasePath: string.isRequired,
      /** Google Analytics ID */
      gaId: string,
    }),
    /** This is tree-like sitemap of styleguide */
    routes: arrayOf(
      shape({
        /** Route title */
        title: string.isRequired,
        /** Part of URL which describes this tree node */
        path: string.isRequired,
        /** If this route is leaf, Node to render, if this is leaf */
        render: node,
        /** If this route is node, other routes are children */
        nodes: array,
      })
    ),
  };

  constructor(props) {
    super(props);
    this.state = {
      isNavActive: false,
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleNavLinkClick = this.handleNavLinkClick.bind(this);
  }

  handleClick() {
    this.setState({ isNavActive: !this.state.isNavActive });
  }

  handleNavLinkClick() {
    if (this.state.isNavActive) {
      this.setState({ isNavActive: false });
    }
  }

  render() {
    const { className, config = {}, routes, ...other } = this.props;
    const {
      version,
      logo,
      logoSmall,
      name,
      theme: projectTheme = {},
      styleguideBasePath = '/styleguide/',
      gaId,
    } = config;

    const activeClass = this.state.isNavActive ? 'is-active' : '';

    // merge styleguide theme and project theme
    const localTheme = Object.keys(projectTheme).reduce((acc, prop) => {
      if (prop === 'previewBackgrounds') {
        acc[prop] = projectTheme[prop];

        return acc;
      }

      if (typeof theme[prop] === 'object') {
        acc[prop] = {
          ...(theme[prop] || {}),
          ...projectTheme[prop],
        };
      } else {
        acc[prop] = projectTheme[prop];
      }

      return acc;
    }, Object.assign({}, theme));

    return (
      <Fragment>
        <GlobalStyle />
        <BrowserRouter basename={styleguideBasePath}>
          {gaId && init({ gaId }) && <RouteTracker />}
          <ThemeProvider theme={localTheme}>
            <PageBody className={activeClass}>
              <PageContent>
                <Suspense fallback={<div />}>
                  <Sitemap routes={routes} />
                </Suspense>
              </PageContent>
              <Suspense fallback={<div />}>
                <Sidebar>
                  <PageSidebarHeader
                    key="header"
                    project={logo || name}
                    projectSmall={logoSmall || name}
                    pageTitle="Bar"
                    {...other}
                  />
                  <Search list={routes} />
                  <PageSidebarMain>
                    <Navigation
                      routes={routes}
                      onNavLinkClick={() => this.handleNavLinkClick()}
                    />
                  </PageSidebarMain>
                  <PageSidebarFooter>{`v${version}`}</PageSidebarFooter>
                </Sidebar>
                <NavigationBar
                  onButtonClick={this.handleClick}
                  isActive={this.state.isNavActive}
                />
                <Overlay className={activeClass} onClick={this.handleClick} />
              </Suspense>
            </PageBody>
          </ThemeProvider>
        </BrowserRouter>
      </Fragment>
    );
  }
}

const GlobalStyle = createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0;
    text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
  }

  * { box-sizing: border-box; }
  *::after { box-sizing: border-box; }
  *::before { box-sizing: border-box; }
`;

const Overlay = styled('div')`
  .is-active & {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: ${props => props.theme.zIndex.overlay};
    background-color: ${props => props.theme.colors.overlay};
  }
`;

const PageBody = styled.div`
  position: relative;
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  align-items: flex-start;
  z-index: ${props => props.theme.zIndex.content};
  
  @media (max-width: calc(${props => props.theme.breakpoints.l} - 1px)) {
    &.is-active {
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
`;

const PageContent = styled.main`
  position: relative;
  flex: 1 1 auto;
  align-self: stretch;
  overflow-x: hidden;
  overflow-y: auto;
  padding: ${props => rem(props.theme.sizes.headerHeight)} 0;
  transition: transform 0.3s ease-in-out 0s, opacity 0.3s ease-in-out 0s;

  .is-active & {
    transform: translateX(${props => rem(props.theme.sizes.sidebarWidth)});
  }

  /* IE */
  @media (min-width: ${props =>
      props.theme.breakpoints.l}) and (-ms-high-contrast: none) {
    max-width: calc(100vw - 16.75em);
    transform: translateX(${props => rem(props.theme.sizes.sidebarWidth)});
    .is-active & {
      left: ${props => rem(props.theme.sizes.sidebarWidth)};
    }
  }

  @media (min-width: ${props => props.theme.breakpoints.l}) {
    padding-left: 0;
    padding: ${props => rem(props.theme.spaces.default)} 0;
    .is-active & {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const PageSidebarMain = styled.div`
  flex: 1;
  overflow-x: hidden;
`;

const PageSidebarHeader = styled(Header)`
  max-width: 100%;
`;

const PageSidebarFooter = styled('p')`
  color: ${props => props.theme.colors.greyText};
  font-size: ${props => props.theme.fontSizes.base};
  margin: 0;
  font-family: ${props => props.theme.fontFamily};
`;

export default App;
