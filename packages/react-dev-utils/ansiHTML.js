/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var Anser = require('anser');

// Color scheme inspired by https://chriskempson.github.io/base16/css/base16-github.css
// var base00 = 'ffffff'; // Default Background
var base01 = 'f5f5f5'; // Lighter Background (Used for status bars)
// var base02 = 'c8c8fa'; // Selection Background
var base03 = '969896'; // Comments, Invisibles, Line Highlighting
// var base04 = 'e8e8e8'; // Dark Foreground (Used for status bars)
var base05 = '333333'; // Default Foreground, Caret, Delimiters, Operators
// var base06 = 'ffffff'; // Light Foreground (Not often used)
// var base07 = 'ffffff'; // Light Background (Not often used)
var base08 = 'ed6a43'; // Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
// var base09 = '0086b3'; // Integers, Boolean, Constants, XML Attributes, Markup Link Url
// var base0A = '795da3'; // Classes, Markup Bold, Search Text Background
var base0B = '183691'; // Strings, Inherited Class, Markup Code, Diff Inserted
var base0C = '183691'; // Support, Regular Expressions, Escape Characters, Markup Quotes
// var base0D = '795da3'; // Functions, Methods, Attribute IDs, Headings
var base0E = 'a71d5d'; // Keywords, Storage, Selector, Markup Italic, Diff Changed
// var base0F = '333333'; // Deprecated, Opening/Closing Embedded Language Tags e.g. <?php ?>

// Map ANSI colors from what babel-code-frame uses to base16-github
// See: https://github.com/babel/babel/blob/e86f62b304d280d0bab52c38d61842b853848ba6/packages/babel-code-frame/src/index.js#L9-L22
var colors = {
  reset: [base05, 'transparent'],
  black: base05,
  red: base08 /* marker, bg-invalid */,
  green: base0B /* string */,
  yellow: base08 /* capitalized, jsx_tag, punctuator */,
  blue: base0C,
  magenta: base0C /* regex */,
  cyan: base0E /* keyword */,
  gray: base03 /* comment, gutter */,
  lightgrey: base01,
  darkgrey: base03,
};

var anserMap = {
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
};

function ansiHTML(txt) {
  var arr = new Anser().ansiToJson(txt, {
    use_classes: true,
  });

  var result = '';
  var open = false;
  for (var index = 0; index < arr.length; ++index) {
    var c = arr[index];
    var content = c.content, fg = c.fg;

    var contentParts = content.split('\n');
    for (var _index = 0; _index < contentParts.length; ++_index) {
      if (!open) {
        result += '<span data-ansi-line="true">';
        open = true;
      }
      var part = contentParts[_index].replace('\r', '');
      var color = colors[anserMap[fg]];
      if (color != null) {
        result += '<span style="color: #' + color + ';">' + part + '</span>';
      } else {
        if (fg != null) console.log('Missing color mapping: ', fg);
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

module.exports = ansiHTML;
