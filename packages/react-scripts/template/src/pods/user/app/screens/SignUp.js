import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Auth } from 'aws-amplify';
import styled from 'styled-components';

import { Card, Input, Label } from '../components';
import { emailRegex, passwordRegex } from '../services';

class SignIn extends PureComponent {
  constructor(props) {
    super(props);
    this.INITIAL_STATE = {
      username: '',
      password: '',
      error: null,
      isLoading: false,
      errors: {
        username: null,
        password: null,
      },
    };
    this.state = this.INITIAL_STATE;
  }

  _setIsLoading = () => this.setState({ isLoading: true });
  _setStopLoading = () => this.setState({ isLoading: false });

  _onTextInputChange = label => ev =>
    this.setState({
      [label]: ev.target.value,
      errors: {
        ...this.state.errors,
        [label]: null,
      },
    });

  _handleStateChange = (newState, params = null) => () => {
    const { onStateChange } = this.props;
    onStateChange(newState, params);
  };

  _renderAnchor = username => (
    <Fragment>
      <Label
        marginTop="15px"
        cursor="pointer"
        color="#fff"
        fontSize="15px"
        onClick={this._handleStateChange('signUp')}
      >
        Don't have an account yet?
      </Label>
    </Fragment>
  );

  _signIn = () => {
    const { username, password } = this.state;
    this._setIsLoading();
    Auth.signIn(username, password)
      .catch(err => {
        if (err.code) {
          const { code } = err;
          this.setState(this.INITIAL_STATE, this._handleExceptions(code));
        } else {
          this.setState({ error: err });
        }
      })
      .finally(() => this._setStopLoading);
  };

  _formHasErrors = () => {
    const { errors } = this.state;
    const hasErrors = Object.values(errors).some(
      value => typeof value === 'string'
    );

    return hasErrors;
  };

  _handleExceptions = exception => {
    const { username } = this.state;
    switch (exception) {
      case 'UserNotConfirmedException':
        return this._handleStateChange('confirmSignUp', {
          backState: 'signIn',
          username,
          errorCode: 'UserNotConfirmedException',
        })();
      case 'UserNotFoundException':
        return this._handleStateChange('signUp', {
          backState: 'signIn',
          username,
          errorCode: 'UserNotFoundException',
        })();
      default:
        alert('Unhandled exception', exception);
        break;
    }
  };

  _submit = () => {
    const { username, password } = this.state;
    this.setState(
      {
        errors: {
          username:
            !username.length || !emailRegex.test(username)
              ? 'InvalidEmailFormat'
              : false,
          password:
            !password.length || !passwordRegex.test(password)
              ? 'InvalidPasswordFormat'
              : false,
        },
      },
      () => (!this._formHasErrors() ? this._signIn() : null)
    );
  };

  render() {
    const { authState } = this.props;
    const { username, password, error, errors, isLoading } = this.state;
    if (!['signIn', 'signedOut', 'signedUp'].includes(authState)) {
      return null;
    }
    return (
      <Card
        title="Sign In"
        btnSubmitLabel="Sign In"
        isLoading={isLoading}
        Anchor={this._renderAnchor(username)}
        onSubmit={this._submit}
      >
        {error && <Error>* {error}</Error>}
        <Input
          required
          type="email"
          placeholder="username"
          autoComplete="current-username"
          value={username}
          error={errors.username}
          onChange={this._onTextInputChange('username')}
        />
        <Input
          required
          type="password"
          placeholder="password"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={this._onTextInputChange('password')}
        />
      </Card>
    );
  }
}

const Error = styled(Label)`
  width: calc(100% - 12px);
  font-size: 12px;
  margin: 4px 6px 6px;
  color: red;
`;

SignIn.propTypes = {
  authState: PropTypes.string,
  onStateChange: PropTypes.func,
};

export default SignIn;
