import React from 'react';
import { createUseStyles } from 'react-jss';
import TextField from '@guestyci/foundation/TextField';
import Col from '@guestyci/foundation/Col';
import logo from '../../assets/logo.svg';
import Link from '@guestyci/foundation/Link';

const useStyles = createUseStyles({
  appLogo: {
    animation: '$spin infinite 20s linear',
    pointerEvents: 'none',
    height: 100,
    width: 100,
  },
  '@keyframes spin': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
});

const Header = () => {
  const classes = useStyles();
  return (
    <Col spacing={1} align="center" justify="center">
      <img src={logo} className={classes.appLogo} alt="logo" />
      <TextField className="pt-3" size="lg-xl">
        Welcome to Guesty's React project.
      </TextField>
      <TextField size="lg-xl">Edit the ./App.js to start.</TextField>
      <TextField size="xl"> Read the Guesty docs </TextField>
      <Link
        color="blue"
        href="https://rnd-docs.guesty.com/ui-infra/react/overview/"
      >
        Learn React
      </Link>
    </Col>
  );
};

export default Header;
