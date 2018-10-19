/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc) {
    // FIXME: this is a second argument but for some reason /en/ links don't work.
    let language = '';

    const baseUrl = this.props.config.baseUrl;
    return `${baseUrl}docs/${language ? `${language}/` : ''}${doc}`;
  }

  pageUrl(doc) {
    // FIXME: this is a second argument but for some reason /en/ links don't work.
    let language = '';

    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? `${language}/` : '') + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('getting-started', this.props.language)}>
              Get Started
            </a>
            <a
              href="https://reactjs.org/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Learn React
            </a>
          </div>
          <div>
            <h5>Community</h5>
            <a
              href="https://stackoverflow.com/questions/tagged/create-react-app"
              target="_blank"
              rel="noreferrer noopener"
            >
              Stack Overflow
            </a>
            <a
              href="https://spectrum.chat/react"
              target="_blank"
              rel="noreferrer noopener"
            >
              Spectrum
            </a>
            <a
              href="https://twitter.com/reactjs"
              target="_blank"
              rel="noreferrer noopener"
            >
              Twitter
            </a>
          </div>
          <div>
            <h5>More</h5>
            <a href="https://www.github.com/facebook/create-react-app">
              GitHub
            </a>
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/facebook/create-react-app/stargazers"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub"
            >
              Star
            </a>
          </div>
        </section>

        <a
          href="https://code.facebook.com/projects/"
          target="_blank"
          rel="noreferrer noopener"
          className="fbOpenSource"
        >
          <img
            src={`${this.props.config.baseUrl}img/oss_logo.png`}
            alt="Facebook Open Source"
            width="170"
            height="45"
          />
        </a>
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    );
  }
}

module.exports = Footer;
