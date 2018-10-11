/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

function imgUrl(img) {
  return `${siteConfig.baseUrl}img/${img}`;
}

function docUrl(doc, language) {
  return `${siteConfig.baseUrl}docs/${language ? `${language}/` : ''}${doc}`;
}

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

const SplashContainer = props => (
  <div className="homeContainer">
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">{props.children}</div>
    </div>
  </div>
);

const Logo = props => (
  <div className="projectLogo">
    <img src={props.img_src} alt="Project Logo" />
  </div>
);

const ProjectTitle = () => (
  <h2 className="projectTitle">
    {siteConfig.title}
    <small>{siteConfig.tagline}</small>
  </h2>
);

const PromoSection = props => (
  <div className="section promoSection">
    <div className="promoRow">
      <div className="pluginRowBlock">{props.children}</div>
    </div>
  </div>
);

class HomeSplash extends React.Component {
  render() {
    const language = this.props.language || '';
    return (
      <SplashContainer>
        <Logo img_src={imgUrl('logo.svg')} />
        <div className="inner">
          <ProjectTitle />
          <PromoSection>
            <Button href={docUrl('getting-started', language)}>
              Get started
            </Button>
            <Button href={docUrl('documentation-intro', language)}>
              Documentation
            </Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

const Block = props => (
  <Container
    padding={props.padding}
    id={props.id}
    background={props.background}
  >
    <GridBlock
      align={props.align}
      contents={props.children}
      layout={props.layout}
    />
  </Container>
);
Block.defaultProps = {
  padding: ['bottom', 'top'],
};

const Features = props => (
  <Block layout="threeColumn" {...props}>
    {[
      {
        content:
          'There is just one build dependency. It uses Webpack, Babel, ESLint, and other amazing projects, but provides a cohesive curated experience on top of them.',
        title: 'One dependency',
      },
      {
        content:
          "You don't need to configure anything. Reasonably good configuration of both development and production builds is handled for you so you can focus on writing code.",
        title: 'No configuration required',
      },
      {
        content:
          'You can “eject” to a custom setup at any time. Run a single command, and all the configuration and build dependencies will be moved directly into your project, so you can pick up right where you left off.',
        title: 'No lock-in',
      },
    ]}
  </Block>
);

const GetStarted = props => (
  <Block layout="twoColumn" background="light" {...props}>
    {[
      {
        title: 'Get started coding in a matter of seconds!',
        content: `With Create React App, you get to focus on **writing React, not boilerplate**.
All you need to do is run a command, install some dependencies, and decide what's for dinner.

\`\`\`sh
npx create-react-app my-app
\`\`\`
`,
      },
      {
        image:
          'https://camo.githubusercontent.com/29765c4a32f03bd01d44edef1cd674225e3c906b/68747470733a2f2f63646e2e7261776769742e636f6d2f66616365626f6f6b2f6372656174652d72656163742d6170702f323762343261632f73637265656e636173742e737667',
        imageAlign: 'right',
      },
    ]}
  </Block>
);

const Update = props => (
  <Block layout="twoColumn" {...props}>
    {[
      {
        image: imgUrl('update.png'),
        imageAlign: 'left',
      },
      {
        title: 'Easy-to-maintain toolchain',
        content: `Keeping a build toolchain up to date with the latest and greatest can be a daunting and time-consuming
task for even the most seasoned developer. Create React App extracts all of those concerns into a single
dependency, which are **easy to update** and **battle tested by thousands**

\`\`\`sh
npm install react-scripts@latest
\`\`\``,
      },
    ]}
  </Block>
);

const FineGrainedFeatures = props => (
  <Block layout="fourColumn" align="center" padding={['bottom']} {...props}>
    {[
      {
        title: 'Webpack 4',
        content:
          'Webpack 4 gives you lightning fast rebuilds and code-splitting out of the box',
      },
      {
        title: 'Babel 7',
        content:
          'Babel 7 transpiles your code faster than ever, now with support for the new Fragment syntax `</>`',
      },
      {
        title: 'ES2015+',
        content:
          'Create React App is set up for you to use the features of the future',
      },
      {
        title: 'Jest',
        content:
          'The best test runner in the business is set up for you by default',
      },
      {
        title: 'Dev-server',
        content:
          'No-hassle local development thanks to the built-in dev-server',
      },
      {
        title: 'PostCSS',
        content:
          'Prefixing of new CSS features are done for you through Autoprefixer',
      },
      {
        title: 'SASS',
        content: 'Now you can write your styles with the power of SASS',
      },
      {
        title: 'CSS Modules',
        content: 'CSS Modules are also supported out of the box',
      },
      {
        title: 'Babel Macros',
        content:
          'Need some extra Babel-power? Babel Macros gives you just that!',
      },
      {
        title: 'SVGs in React',
        content:
          'Now you can import your SVGs and use them as React components',
      },
      {
        title: 'Progressive Web Apps',
        content:
          'Every app created by Create React App is a fully Lighthouse-compliant PWA - opt in.',
      },
      {
        title: 'Great DX',
        content:
          "Create React App is made for you - the developer. And we've made your day-to-day so much better",
      },
    ]}
  </Block>
);

class Index extends React.Component {
  render() {
    const language = this.props.language || '';

    return (
      <div>
        <HomeSplash language={language} />
        <div className="mainContainer">
          <Features align="center" />
          <GetStarted align="left" />
          <Update align="left" />
          <FineGrainedFeatures align="center" />
        </div>
      </div>
    );
  }
}

module.exports = Index;
