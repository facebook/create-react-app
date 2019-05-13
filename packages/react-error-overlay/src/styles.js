/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
export type Theme = {|
  // Colors for components styles
  background: string,
  color: string,
  headerColor: string,
  primaryPreBackground: string,
  primaryPreColor: string,
  secondaryPreBackground: string,
  secondaryPreColor: string,
  footer: string,
  anchorColor: string,
  toggleColor: string,
  closeColor: string,
  primaryErrorBackground: string,
  secondaryErrorBackground: string,
  navBackground: string,
  navArrow: string,
  // ANSI colors
  // Light color scheme inspired by https://chriskempson.github.io/base16/css/base16-github.css
  // base00: string; // Default Background
  base01: string, // Lighter Background (Used for status bars)
  // base02: string, // Selection Background
  base03: string, // Comments, Invisibles, Line Highlighting
  // base04: string, // Dark Foreground (Used for status bars)
  base05: string, // Default Foreground, Caret, Delimiters, Operators
  // base06: string, // Light Foreground (Not often used)
  // base07: string, // Light Background (Not often used)
  base08: string, // Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
  // base09: string, // Integers, Boolean, Constants, XML Attributes, Markup Link Url
  // base0A: string, // Classes, Markup Bold, Search Text Background
  base0B: string, // Strings, Inherited Class, Markup Code, Diff Inserted
  base0C: string, // Support, Regular Expressions, Escape Characters, Markup Quotes
  // base0D: string, // Functions, Methods, Attribute IDs, Headings
  base0E: string, // Keywords, Storage, Selector, Markup Italic, Diff Changed
  // base0F: string, // Deprecated, Opening/Closing Embedded Language Tags e.g. <?php ?>
|};
const lightTheme: Theme = {
  // Colors for components styles
  background: 'white',
  color: 'black',
  headerColor: '#ce1126',
  primaryPreBackground: 'rgba(206, 17, 38, 0.05)',
  primaryPreColor: 'inherit',
  secondaryPreBackground: 'rgba(251, 245, 180, 0.3)',
  secondaryPreColor: 'inherit',
  footer: '#878e91',
  anchorColor: '#878e91',
  toggleColor: '#878e91',
  closeColor: '#293238',
  primaryErrorBackground: '#fccfcf',
  secondaryErrorBackground: '#fbf5b4',
  navBackground: 'rgba(206, 17, 38, 0.05)',
  navArrow: '#ce1126',
  // ANSI colors
  // Color scheme inspired by https://chriskempson.github.io/base16/css/base16-github.css
  // const base00 = 'ffffff'; // Default Background
  base01: 'f5f5f5', // Lighter Background (Used for status bars)
  // const base02 = 'c8c8fa'; // Selection Background
  base03: '6e6e6e', // Comments, Invisibles, Line Highlighting
  // const base04 = 'e8e8e8'; // Dark Foreground (Used for status bars)
  base05: '333333', // Default Foreground, Caret, Delimiters, Operators
  // const base06 = 'ffffff'; // Light Foreground (Not often used)
  // const base07 = 'ffffff'; // Light Background (Not often used)
  base08: '881280', // Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
  // const base09 = '0086b3'; // Integers, Boolean, Constants, XML Attributes, Markup Link Url
  // const base0A = '795da3'; // Classes, Markup Bold, Search Text Background
  base0B: '1155cc', // Strings, Inherited Class, Markup Code, Diff Inserted
  base0C: '994500', // Support, Regular Expressions, Escape Characters, Markup Quotes
  // const base0D = '795da3'; // Functions, Methods, Attribute IDs, Headings
  base0E: 'c80000', // Keywords, Storage, Selector, Markup Italic, Diff Changed
  // const base0F = '333333'; // Deprecated, Opening/Closing Embedded Language Tags e.g. <?php ?>
};

const darkTheme: Theme = {
  // Colors for components styles
  background: '#353535',
  color: 'white',
  headerColor: '#fccfcf',
  primaryPreBackground: 'rgba(206, 17, 38, 0.15)',
  primaryPreColor: '#fccfcf',
  secondaryPreBackground: 'rgba(251, 245, 180, 0.3)',
  secondaryPreColor: '#fbf5b4',
  footer: '#878e91',
  anchorColor: '#878e91',
  toggleColor: '#878e91',
  closeColor: '#ffffff',
  primaryErrorBackground: '#fccfcf',
  secondaryErrorBackground: '#fbf5b4',
  navBackground: 'rgba(206, 17, 38, 0.05)',
  navArrow: '#ce1126',
  // ANSI colors
  // Color scheme inspired by https://chriskempson.github.io/base16/css/base16-github.css
  // const base00 = 'ffffff'; // Default Background
  base01: 'f5f5f5', // Lighter Background (Used for status bars)
  // const base02 = 'c8c8fa'; // Selection Background
  base03: '6e6e6e', // Comments, Invisibles, Line Highlighting
  // const base04 = 'e8e8e8'; // Dark Foreground (Used for status bars)
  base05: '333333', // Default Foreground, Caret, Delimiters, Operators
  // const base06 = 'ffffff'; // Light Foreground (Not often used)
  // const base07 = 'ffffff'; // Light Background (Not often used)
  base08: '881280', // Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted
  // const base09 = '0086b3'; // Integers, Boolean, Constants, XML Attributes, Markup Link Url
  // const base0A = '795da3'; // Classes, Markup Bold, Search Text Background
  base0B: '1155cc', // Strings, Inherited Class, Markup Code, Diff Inserted
  base0C: '994500', // Support, Regular Expressions, Escape Characters, Markup Quotes
  // const base0D = '795da3'; // Functions, Methods, Attribute IDs, Headings
  base0E: 'c80000', // Keywords, Storage, Selector, Markup Italic, Diff Changed
  // const base0F = '333333'; // Deprecated, Opening/Closing Embedded Language Tags e.g. <?php ?>
};

const iframeStyle = {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  border: 'none',
  'z-index': 2147483647,
};

const overlayStyle = (theme: Theme) => ({
  width: '100%',
  height: '100%',
  'box-sizing': 'border-box',
  'text-align': 'center',
  'background-color': theme.background,
});

export { iframeStyle, overlayStyle, lightTheme, darkTheme };
