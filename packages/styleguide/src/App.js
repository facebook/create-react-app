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
      isNavActive: false
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
      styleguideBasePath = '/styleguide/'
    } = config;

    const activeClass = this.state.isNavActive ? 'is-active' : '';

    // merge styleguide theme and project theme
    const localTheme = Object.keys(theme).reduce((acc, prop) => {
      if (typeof theme[prop] === 'object') {
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
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const PageHeader = styled(Header)`
  width: 100%;
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
  display: flex;
  flex: 1 1 auto;
`;

const PageSidebar = styled(Sidebar)`
  position: absolute;
  min-height: 100%;
  max-height: 100%;
  flex: 0 0 ${props => rem(props.theme.sizes.sidebarWidth)};
  order: -1;
  overflow: auto;
  transform: translateX(-${props => rem(props.theme.sizes.sidebarWidth)});
  transition: transform 0.3s ease-in-out 0s;
  z-index: ${props => props.theme.zIndex.sidebar};

  @media (min-width: ${props => props.theme.breakpoints.l}) {
    margin-left: 0;
    position: relative;
    transform: translateX(0);
  }

  .is-active & {
    transform: translateX(0);
  }
`;

const PageContent = styled.main`
  position: relative;
  flex: 1 1 auto;
  overflow-x: hidden;
  overflow-y: auto;
  padding: ${props => rem(props.theme.spaces.default)} 0;
  transition: transform 0.3s ease-in-out 0s, opacity 0.3s ease-in-out 0s;

  .is-active & {
    transform: translateX(${props => rem(props.theme.sizes.sidebarWidth)});
    opacity: 0.5;
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
