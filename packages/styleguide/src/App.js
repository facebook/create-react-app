import React from 'react';
import {} from 'prop-types';
import { BrowserRouter } from 'react-router-dom';

import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';

import * as theme from './style/theme';
import { rem } from './style/utils';

import { init, RouteTracker } from './components/GoogleAnalytics';
import Header from './components/Header/';
import Sidebar from './components/Sidebar/';
import Navigation from './components/Navigation/';
import NavigationButton from './components/NavigationButton/';
import Sitemap from './components/Sitemap';

import MdxWrapper from './utils/mdx';

class App extends React.Component {
  static displayName = 'App';

  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      isNavActive: false,
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleNavLinkClick = this.handleNavLinkClick.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  handleClick() {
    this.setState({ isNavActive: !this.state.isNavActive });
  }

  handleNavLinkClick() {
    if (this.state.isNavActive) {
      this.setState({ isNavActive: false });
    }
  }

  render() {
    const { className, config, routes, ...other } = this.props;
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
      <MdxWrapper>
        <GlobalStyle />
        <BrowserRouter basename={styleguideBasePath}>
          {gaId && init({ gaId }) && <RouteTracker />}
          <ThemeProvider theme={localTheme}>
            <PageLayout>
              <PageHeader
                key="header"
                project={logo || name}
                projectSmall={logoSmall || name}
                pageTitle="Bar"
                infoText={`v${version}`}
                {...other}
              >
                <NavigationButton
                  onClick={() => this.handleClick()}
                  isActive={this.state.isNavActive}
                />
              </PageHeader>
              <PageBody className={activeClass}>
                <PageContent>
                  <Sitemap routes={routes} />
                </PageContent>
                <PageSidebar>
                  <Navigation
                    routes={routes}
                    onNavLinkClick={() => this.handleNavLinkClick()}
                  />
                </PageSidebar>
              </PageBody>
            </PageLayout>
          </ThemeProvider>
        </BrowserRouter>
      </MdxWrapper>
    );
  }
}

/* eslint-disable */
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
/* eslint-enable */

const PageLayout = styled.div``;

const PageHeader = styled(Header)`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  max-width: 100%;
  height: ${props => rem(props.theme.sizes.headerHeight)};
  display: flex;
  flex: 0 0 auto;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${props => rem(props.theme.spaces.large)};
  background-color: ${props => props.theme.colors.main};
  color: ${props => props.theme.colors.black};
  z-index: ${props => props.theme.zIndex.header};
`;

const PageBody = styled.div`
  position: relative;
  height: calc(100vh - 6rem);
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  align-items: flex-start;
  z-index: ${props => props.theme.zIndex.content};
  top: 6rem;
  overflow: hidden;
  
  @media (max-width: calc(${props => props.theme.breakpoints.l} - 1px)) {
    &.is-active {
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
`;

const PageSidebar = styled(Sidebar)`
  position: fixed;
  top: 6rem;
  height: calc(100vh - 6rem);
  flex: 0 0 ${props => rem(props.theme.sizes.sidebarWidth)};
  order: -1;
  overflow: auto;
  transform: translateX(-${props => rem(props.theme.sizes.sidebarWidth)});
  transition: transform 0.3s ease-in-out 0s;
  z-index: ${props => props.theme.zIndex.sidebar};

  /* IE */
  @media all and (-ms-high-contrast: none) {
    left: 0;
  }

  @media (min-width: ${props => props.theme.breakpoints.l}) {
    position: sticky;
    transform: translateX(0);
  }

  .is-active & {
    transform: translateX(0);
  }
`;

const PageContent = styled.main`
  position: relative;
  flex: 1 1 auto;
  align-self: stretch;
  overflow-x: hidden;
  overflow-y: auto;
  padding: ${props => rem(props.theme.spaces.default)} 0;
  transition: transform 0.3s ease-in-out 0s, opacity 0.3s ease-in-out 0s;

  .is-active & {
    transform: translateX(${props => rem(props.theme.sizes.sidebarWidth)});
    opacity: 0.5;
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
    .is-active & {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

export default App;
