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
              Get Started
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
        title: 'Less to Learn',
        content:
          "You don't need to learn and configure many build tools. Instant reloads help you focus on development. When it's time to deploy, your bundles are optimized automatically.",
      },
      {
        title: 'Only One Dependency',
        content:
          'Your app only needs one build dependency. We test Create React App to make sure that all of its underlying pieces work together seamlessly – no complicated version mismatches.',
      },
      {
        title: 'No Lock-In',
        content:
          'Under the hood, we use Webpack, Babel, ESLint, and other amazing projects to power your app. If you ever want an advanced configuration, you can ”eject” from Create React App and edit their config files directly.',
      },
    ]}
  </Block>
);

const GetStarted = props => (
  <Block layout="twoColumn" background="light" {...props}>
    {[
      {
        title: 'Get started in seconds',
        content: `Whether you’re using React or another library, Create React App lets you **focus on code, not build tools**.

To create a project called \`my-app\`, run this command:

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
        title: 'Easy to maintain',
        content: `Updating your build tooling is typically a daunting and time-consuming task. When new versions of Create React App are released, you can upgrade using a single command:

\`\`\`sh
npm install react-scripts@latest
\`\`\``,
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
          <Features align="left" />
          <GetStarted align="left" />
          <Update align="left" />
        </div>
      </div>
    );
  }
}

module.exports = Index;
