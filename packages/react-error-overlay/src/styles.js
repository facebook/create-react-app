/* @flow */
const black = '#293238',
  darkGray = '#878e91',
  lightGray = '#fafafa',
  red = '#ce1126',
  lightRed = '#fccfcf',
  yellow = '#fbf5b4',
  white = '#ffffff';

const iframeStyle = {
  'background-color': 'rgba(0,0,0,.5)',
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
  position: 'absolute',
  top: '0.5rem',
  left: '50%',
  'margin-left': '0',
  'margin-right': '-50%',
  transform: 'translate(-50%, 0)',
  display: 'inline-block',
  margin: '0.5rem',
  'max-height': 'calc(100% - 1rem)',
  'max-width': 'calc(100% - 1rem)',
  'box-sizing': 'border-box',
  padding: '0 1rem',
  'font-family': 'Consolas, Menlo, monospace',
  'font-size': '10px',
  color: black,
  'white-space': 'pre-wrap',
  overflow: 'auto',
  'overflow-x': 'hidden',
  'word-break': 'break-word',
  'line-height': 1.5,
  'background-color': white,
  'border-radius': '0.25rem',
  'box-shadow': '0 0 10px 0 rgba(0, 0, 0, 0.15)',
};

const craContainer = {
  display: 'flex',
  'flex-direction': 'column',
  'max-height': '100%',
};

const hintsStyle = {
  color: darkGray,
};

const hintStyle = {
  padding: '0.5em 1em',
  cursor: 'pointer',
};

const closeButtonStyle = {
  'font-size': '26px',
  color: black,
  'line-height': '1rem',
  'font-size': '1.5rem',
  padding: '1rem',
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
  'font-family': 'sans-serif',
  color: red,
  'white-space': 'pre-wrap',
  flex: '0 0 auto',
  margin: '0.75rem 0 0',
};

const functionNameStyle = {
  'margin-top': '1em',
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
  overflow: 'auto',
  flex: '1 1 auto',
};

const depStyle = {};

const primaryErrorStyle = {
  'background-color': lightRed,
};

const secondaryErrorStyle = {
  'background-color': yellow,
};

const omittedFramesStyle = {
  color: black,
  margin: '1.5em 0',
  cursor: 'pointer',
};

const preStyle = {
  display: 'block',
  padding: '0.5em',
  'margin-top': '1.5em',
  'margin-bottom': '0px',
  'overflow-x': 'auto',
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
  'font-family': 'sans-serif',
  color: darkGray,
  flex: '0 0 auto',
  'margin-top': '0.5rem',
  'margin-bottom': '1rem',
};

export {
  craContainer,
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
