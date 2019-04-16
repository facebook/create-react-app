import React from 'react';
import withStyles from 'react-jss';
import logo from './logo.svg';

const styles = {
  app: {
    textAlign: 'center',
  },

  appLogo: {
    animation: '$spin infinite 20s linear',
    pointerEvents: 'none',
    height: 100,
    width: 100,
  },

  appHeader: {
    background: '#282c34',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'calc(10px + 2vmin)',
    color: 'white',
  },

  appLink: {
    color: '#61dafb',
  },

  '@keyframes spin': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
};

function App({ classes }) {
  return (
    <div className={classes.app}>
      <header className={classes.appHeader}>
        <img src={logo} className={classes.appLogo} alt="logo" />
        <p>Welcome to Guesty's React project.</p>
        <p>Edit the ./App.js to start.</p>
        <div> Read the Guesty docs </div>
        <a
          className={classes.appLink}
          href="https://rnd-docs.guesty.com/ui-infra/react/overview/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default withStyles(styles)(App);
