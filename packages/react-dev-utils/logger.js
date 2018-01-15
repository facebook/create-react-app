'use strict';
const React = require('react');
const ReactDOM = require('react-dom');
const h = React.createElement;

const id = 'create-react-app-logger';

let dom = document.getElementById(id);

if (!dom) {
  dom = document.createElement('div');
  dom.id = id;
  document.body.appendChild(dom);
}

const style = {
  root: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    padding: 10,
    margin: 'auto',
    transition: '250ms',
    lineHeight: '24px',
    borderTopLeftRadius: '2px',
    borderTopRightRadius: '2px',
    display: 'flex',
    fontFamily: 'monospace',
    color: '#293238',
  },
  active: {
    transform: 'translateY(0)',
  },
  inactive: {
    transform: 'translateY(100%)',
  },
  link: {
    padding: '0',
    background: 'transparent',
    border: '0',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    textTransform: 'uppercase',
    textDecoration: 'none',
  },
  button: {
    padding: '0',
    background: 'transparent',
    border: '0',
    color: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    textTransform: 'uppercase',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  text: {
    flex: '1',
  },
};

class Logger extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      active: true,
    };
    this.close = () => {
      clearTimeout(this.timeout);
      this.setState({
        active: false,
      });
    };
  }

  componentDidMount() {
    this.timeout = setTimeout(() => {
      this.setState({
        active: false,
      });
    }, this.props.timeout);
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  render() {
    return h(
      'div',
      {
        style: Object.assign(
          {},
          style.root,
          this.state.active ? style.active : style.inactive,
          getColor(this.props.type)
        ),
      },
      h('span', { style: style.text }, this.props.children),
      h('button', { style: style.button, onClick: this.close }, 'Dismiss')
    );
  }
}

Logger.defaultProps = {
  timeout: 10000,
};

function getColor(type) {
  switch (type) {
    case 'info':
      return {
        background: '#61dafb',
      };
    case 'warn':
      return {
        background: '#fbf5b4',
      };
    case 'error':
      return {
        background: '#fccfcf',
      };
    default:
      return {
        color: 'transparent',
      };
  }
}

function render(type, message) {
  ReactDOM.render(h(Logger, { type }, message), dom);
}

const logger = {
  info(message) {
    if (typeof console !== 'undefined' && typeof console.info === 'function') {
      console.info(message);
    }
    render('info', message);
  },
  error(message) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(message);
    }
    render('error', message);
  },
  warn(message) {
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
      console.warn(message);
    }
    render('warn', message);
  },
  clear() {
    if (typeof console !== 'undefined' && typeof console.clear === 'function') {
      console.clear();
    }
    render('clear');
  },
};

logger.clear();

module.exports = logger;
