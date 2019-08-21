import React from 'react';
import withStyles from 'react-jss';
import TextField from '@guestyci/foundation/TextField';
import logo from '../../assets/logo.svg';
import Link from '../link/Link';
const styles = {
  appLogo: {
    animation: 'spin infinite 20s linear',
    pointerEvents: 'none',
    height: 100,
    width: 100,
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

const Header = ({ classes }) => (
    <Col spacing={2} align="center" justify="center">
        <img src={logo} className={classes.appLogo} alt="logo" />
        <TextField>Welcome to Guesty's React project.</TextField>
        <TextField>Edit the ./App.js to start.</TextField>
        <TextField> Read the Guesty docs </TextField>
        <Link
          className={classes.appLink}
          href="https://rnd-docs.guesty.com/ui-infra/react/overview/"
        >
          Learn React
        </Link>
    </Col>
);

export default withStyles(styles)(Header);
