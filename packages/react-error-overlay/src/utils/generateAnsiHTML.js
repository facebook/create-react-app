/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */

import Anser from 'anser';
import { AllHtmlEntities as Entities } from 'html-entities';
import type { Theme } from '../styles';

const entities = new Entities();

// Map ANSI colors from what babel-code-frame uses to base16-github
// See: https://github.com/babel/babel/blob/e86f62b304d280d0bab52c38d61842b853848ba6/packages/babel-code-frame/src/index.js#L9-L22
const colors = (theme: Theme) => ({
  reset: [theme.base05, 'transparent'],
  black: theme.base05,
  red: theme.base08 /* marker, bg-invalid */,
  green: theme.base0B /* string */,
  yellow: theme.base08 /* capitalized, jsx_tag, punctuator */,
  blue: theme.base0C,
  magenta: theme.base0C /* regex */,
  cyan: theme.base0E /* keyword */,
  gray: theme.base03 /* comment, gutter */,
  lightgrey: theme.base01,
  darkgrey: theme.base03,
});

const anserMap = {
  'ansi-bright-black': 'black',
  'ansi-bright-yellow': 'yellow',
  'ansi-yellow': 'yellow',
  'ansi-bright-green': 'green',
  'ansi-green': 'green',
  'ansi-bright-cyan': 'cyan',
  'ansi-cyan': 'cyan',
  'ansi-bright-red': 'red',
  'ansi-red': 'red',
  'ansi-bright-magenta': 'magenta',
  'ansi-magenta': 'magenta',
  'ansi-white': 'darkgrey',
};

function generateAnsiHTML(txt: string, theme: Theme): string {
  const arr = new Anser().ansiToJson(entities.encode(txt), {
    use_classes: true,
  });

  let result = '';
  let open = false;
  for (let index = 0; index < arr.length; ++index) {
    const c = arr[index];
    const content = c.content,
      fg = c.fg;

    const contentParts = content.split('\n');
    for (let _index = 0; _index < contentParts.length; ++_index) {
      if (!open) {
        result += '<span data-ansi-line="true">';
        open = true;
      }
      const part = contentParts[_index].replace('\r', '');
      const color = colors(theme)[anserMap[fg]];
      if (color != null) {
        result += '<span style="color: ' + color + ';">' + part + '</span>';
      } else {
        if (fg != null) {
          console.log('Missing color mapping: ', fg);
        }
        result += '<span>' + part + '</span>';
      }
      if (_index < contentParts.length - 1) {
        result += '</span>';
        open = false;
        result += '<br/>';
      }
    }
  }
  if (open) {
    result += '</span>';
    open = false;
  }
  return result;
}

export default generateAnsiHTML;
