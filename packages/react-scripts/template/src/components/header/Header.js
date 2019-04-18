import React from 'react';
import withStyles from 'react-jss';
import logo from '../../assets/logo.svg';
import Link from '../link/Link';
const styles = {
  appLogo: {
    animation: '$spin infinite 20s linear',
    pointerEvents: 'none',
    height: 100,
    width: 100,
  },
  appLink: {
    color: '#61dafb',
  },
  appHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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

const Header = ({ classes }) => (
  <header className={classes.appHeader}>
    <img src={logo} className={classes.appLogo} alt="logo" />
    <p>Welcome to Guesty's React project.</p>
    <p>Edit the ./App.js to start.</p>
    <div> Read the Guesty docs </div>
    <Link
      className={classes.appLink}
      href="https://rnd-docs.guesty.com/ui-infra/react/overview/"
    >
      Learn React
    </Link>
  </header>
);

export default withStyles(styles)(Header);
