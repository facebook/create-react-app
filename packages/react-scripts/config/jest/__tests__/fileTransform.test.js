/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const fileTransform = require('../fileTransform');

function loadTransformed(filename) {
  const code = fileTransform.process('', filename);
  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', 'require', code)(
    module,
    module.exports,
    require
  );
  return module.exports;
}

function getRef(element) {
  return element.props.ref !== undefined ? element.props.ref : element.ref;
}

describe('fileTransform', () => {
  describe('non-svg files', () => {
    it('exports the file basename', () => {
      const exported = loadTransformed(path.join('src', 'images', 'logo.png'));
      expect(exported).toBe('logo.png');
    });

    it('does not reference React', () => {
      const code = fileTransform.process('', path.join('src', 'data.txt'));
      expect(code).toBe('module.exports = "data.txt";');
    });
  });

  describe('svg files', () => {
    const svgPath = path.join('src', 'assets', 'my-logo.svg');

    it('exports the basename as default', () => {
      const exported = loadTransformed(svgPath);
      expect(exported.__esModule).toBe(true);
      expect(exported.default).toBe('my-logo.svg');
    });

    it('names the component after the file like SVGR', () => {
      const { ReactComponent } = loadTransformed(svgPath);
      expect(ReactComponent.$$typeof).toBe(Symbol.for('react.forward_ref'));
      expect(ReactComponent.render.name).toBe('SvgMyLogo');
    });

    it('returns a valid React element for the current React version', () => {
      const { ReactComponent } = loadTransformed(svgPath);
      const element = ReactComponent.render({}, null);
      expect(React.isValidElement(element)).toBe(true);
    });

    it('renders an svg element with the filename as children', () => {
      const { ReactComponent } = loadTransformed(svgPath);
      const element = ReactComponent.render({}, null);
      expect(element.type).toBe('svg');
      expect(element.props.children).toBe('my-logo.svg');
    });

    it('passes props through to the svg element', () => {
      const { ReactComponent } = loadTransformed(svgPath);
      const element = ReactComponent.render(
        { className: 'icon', width: 24 },
        null
      );
      expect(element.props.className).toBe('icon');
      expect(element.props.width).toBe(24);
    });

    it('forwards the ref to the svg element', () => {
      const { ReactComponent } = loadTransformed(svgPath);
      const ref = React.createRef();
      const element = ReactComponent.render({}, ref);
      expect(getRef(element)).toBe(ref);
    });

    it('does not mutate the incoming props', () => {
      const { ReactComponent } = loadTransformed(svgPath);
      const props = { title: 'Logo' };
      ReactComponent.render(props, React.createRef());
      expect(props).toEqual({ title: 'Logo' });
    });

    it('can be rendered by react-dom', () => {
      const { ReactComponent } = loadTransformed(svgPath);
      const markup = ReactDOMServer.renderToStaticMarkup(
        React.createElement(ReactComponent, { className: 'icon' })
      );
      expect(markup).toBe('<svg class="icon">my-logo.svg</svg>');
    });
  });
});
