/* @flow */
const black = '#293238',
  darkGray = '#878e91',
  lightGray = '#fafafa',
  red = '#ce1126',
  lightRed = '#fccfcf',
  yellow = '#fbf5b4';

const iframeStyle = {
  'background-color': lightGray,
  position: 'fixed',
  top: '1em',
  left: '1em',
  bottom: '1em',
  right: '1em',
  width: 'calc(100% - 2em)',
  height: 'calc(100% - 2em)',
  border: 'none',
  'border-radius': '3px',
  'box-shadow': '0 0 6px 0 rgba(0, 0, 0, 0.5)',
  'z-index': 1337,
};

const overlayStyle = {
  'box-sizing': 'border-box',
  padding: '4rem',
  'font-family': 'Consolas, Menlo, monospace',
  color: black,
  'white-space': 'pre-wrap',
  overflow: 'auto',
  'overflow-x': 'hidden',
  'word-break': 'break-word',
  'line-height': 1.5,
};

const hintsStyle = {
  'font-size': '0.8em',
  'margin-top': '-3em',
  'margin-bottom': '3em',
  'text-align': 'right',
  color: darkGray,
};

const hintStyle = {
  padding: '0.5em 1em',
  cursor: 'pointer',
};

const closeButtonStyle = {
  'font-size': '26px',
  color: black,
  padding: '0.5em 1em',
  cursor: 'pointer',
  position: 'absolute',
  right: 0,
  top: 0,
};

const additionalStyle = {
  'margin-bottom': '1.5em',
  'margin-top': '-4em',
};

const headerStyle = {
  'font-size': '1.7em',
  'font-weight': 'bold',
  color: red,
  'white-space': 'pre-wrap',
};

const functionNameStyle = {
  'margin-top': '1em',
  'font-size': '1.2em',
};

const linkStyle = {
  'font-size': '0.9em',
};

const anchorStyle = {
  'text-decoration': 'none',
  color: darkGray,
};

const traceStyle = {
  'font-size': '1em',
};

const depStyle = {
  'font-size': '1.2em',
};

const primaryErrorStyle = {
  'background-color': lightRed,
};

const secondaryErrorStyle = {
  'background-color': yellow,
};

const omittedFramesStyle = {
  color: black,
  'font-size': '0.9em',
  margin: '1.5em 0',
  cursor: 'pointer',
};

const preStyle = {
  display: 'block',
  padding: '0.5em',
  'margin-top': '1.5em',
  'margin-bottom': '0px',
  'overflow-x': 'auto',
  'font-size': '1.1em',
  'white-space': 'pre',
};

const toggleStyle = {
  'margin-bottom': '1.5em',
  color: darkGray,
  cursor: 'pointer',
};

const codeStyle = {
  'font-family': 'Consolas, Menlo, monospace',
};

const hiddenStyle = {
  display: 'none',
};

const groupStyle = {
  'margin-left': '1em',
};

const _groupElemStyle = {
  'background-color': 'inherit',
  'border-color': '#ddd',
  'border-width': '1px',
  'border-radius': '4px',
  'border-style': 'solid',
  padding: '3px 6px',
  cursor: 'pointer',
};

const groupElemLeft = Object.assign({}, _groupElemStyle, {
  'border-top-right-radius': '0px',
  'border-bottom-right-radius': '0px',
  'margin-right': '0px',
});

const groupElemRight = Object.assign({}, _groupElemStyle, {
  'border-top-left-radius': '0px',
  'border-bottom-left-radius': '0px',
  'margin-left': '-1px',
});

const footerStyle = {
  'text-align': 'center',
  color: darkGray,
};

export {
  iframeStyle,
  overlayStyle,
  hintsStyle,
  hintStyle,
  closeButtonStyle,
  additionalStyle,
  headerStyle,
  functionNameStyle,
  linkStyle,
  anchorStyle,
  traceStyle,
  depStyle,
  primaryErrorStyle,
  secondaryErrorStyle,
  omittedFramesStyle,
  preStyle,
  toggleStyle,
  codeStyle,
  hiddenStyle,
  groupStyle,
  groupElemLeft,
  groupElemRight,
  footerStyle,
};
