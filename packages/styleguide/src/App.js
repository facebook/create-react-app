import React from 'react';
import {} from 'prop-types';
import { BrowserRouter } from 'react-router-dom';

import styled, { ThemeProvider, injectGlobal } from 'styled-components';

import * as theme from './style/theme';
import { rem } from './style/utils';

import Header from './components/Header/';
import Sidebar from './components/Sidebar/';
import Navigation from './components/Navigation/';
import NavigationButton from './components/NavigationButton/';
import Sitemap from './components/Sitemap';

class App extends React.Component {
  static displayName = 'App';

  static propTypes = {};

  constructor(props) {
    super(props);
    this.state = {
      isActive: false
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleNavLinkClick = this.handleNavLinkClick.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  handleClick() {
    this.setState({ isActive: !this.state.isActive });
  }

  handleNavLinkClick() {
    if (this.state.isActive) {
      this.setState({ isActive: false });
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
      styleguideBasePath = '/styleguide/'
    } = config;

    const activeClass = this.state.isActive ? 'is-active' : '';

    // merge styleguide theme and project theme
    const localTheme = Object.keys(theme).reduce((acc, prop) => {
      if (typeof acc[prop] === 'object') {
        acc[prop] = {
          ...theme[prop],
          ...projectTheme[prop]
        };
      } else {
        acc[prop] = theme[prop];
      }

      return acc;
    }, {});

    return (
      <BrowserRouter basename={styleguideBasePath}>
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
                isActive={this.state.isActive}
              />
            </PageHeader>
            <PageBody>
              <PageContent className={activeClass}>
                <Sitemap routes={routes} />
              </PageContent>
              <PageSidebar className={activeClass}>
                <Navigation
                  routes={routes}
                  onNavLinkClick={() => this.handleNavLinkClick()}
                />
                <NavigationButton
                  onClick={() => this.handleClick()}
                  isActive={this.state.isActive}
                  isMobileButton
                />
              </PageSidebar>
            </PageBody>
          </PageLayout>
        </ThemeProvider>
      </BrowserRouter>
    );
  }
}

/* eslint-disable */
injectGlobal`
  body, html {
  }

  html,
  body {
    padding: 0;
    margin: 0;
    height: 100%;
    text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
  }

  * { box-sizing: border-box; }
  *::after { box-sizing: border-box; }
  *::before { box-sizing: border-box; }
`;
/* eslint-enable */

const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 6rem);
  margin-top: ${props => rem(props.theme.sizes.headerHeight)};
`;

const PageHeader = styled(Header)`
  height: ${props => rem(props.theme.sizes.headerHeight)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${props => rem(props.theme.spaces.large)};
  background-color: ${props => props.theme.colors.main};
  color: ${props => props.theme.colors.black};
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${props => props.theme.zIndex.header};
`;

const PageBody = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (min-width: ${props => props.theme.breakpoints.m}) {
    flex-direction: row;
    flex: 1 0 auto;
  }
`;

const PageSidebar = styled(Sidebar)`
  display: flex;
  order: -1;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 0;
  transition: width 0.3s ease-in-out 0s;
  z-index: ${props => props.theme.zIndex.sidebar};

  &.is-active {
    width: 100vw;
    overflow: auto;

    @media (min-width: ${props => props.theme.breakpoints.s}) {
      width: ${props => rem(props.theme.sizes.sidebarWidth)};
    }
  }

  @media (min-width: ${props => props.theme.breakpoints.s}) {
    top: ${props => rem(props.theme.sizes.headerHeight)};
    left: initial;
    height: calc(100vh - 6rem);
  }

  @media (min-width: ${props => props.theme.breakpoints.l}) {
    width: ${props => rem(props.theme.sizes.sidebarWidth)};
    overflow: auto;
  }
`;

const PageContent = styled.main`
  max-width: 100%;
  padding: ${props => rem(props.theme.spaces.default)}
    ${props => rem(props.theme.spaces.medium)}
    ${props => rem(props.theme.spaces.medium)};
  position: relative;
  left: 0;
  transition: left 0.3s ease-in-out 0s;

  &.is-active {
    left: ${props => rem(props.theme.sizes.sidebarWidth)};
  }

  @media (min-width: ${props => props.theme.breakpoints.l}) {
    width: calc(100vw - ${props => rem(props.theme.sizes.sidebarWidth)});
    margin-left: ${props => rem(props.theme.sizes.sidebarWidth)};
    padding-left: 0;

    &.is-active {
      left: 0;
    }
  }
`;

export default App;
