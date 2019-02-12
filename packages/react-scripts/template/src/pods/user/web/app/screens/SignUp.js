import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Auth } from 'aws-amplify';
import styled from 'styled-components';

import { Card, Input, Label } from '../components';
import { emailRegex, passwordRegex } from '../services';

class SignUp extends PureComponent {
  constructor(props) {
    super(props);
    this.INITIAL_STATE = {
      email: '',
      password: '',
      name: '',
      family_name: '',
      city: '',
      country: '',
      isLoading: false,
      error: null,
      errors: {
        email: null,
        password: null,
        name: null,
        family_name: null,
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

  _handleStateChange = (newState, params) => () => {
    const { onStateChange } = this.props;
    onStateChange(newState, params);
  };

  _signUp = async () => {
    const { email, password, name, family_name, city, country } = this.state;
    try {
      this._setIsLoading();
      const user = await Auth.signUp({
        username: email,
        password,
        attributes: {
          name,
          family_name,
          'custom:city': city,
          'custom:country': country,
        },
      });
      this._handleStateChange('signIn', { email: user.email })();
    } catch (err) {
      alert(`* Error caught in sign up. ${err.message || err}`);
    } finally {
      this._setStopLoading();
    }
  };

  _formHasErrors = () => {
    const { errors } = this.state;
    const hasErrors = Object.values(errors).some(
      value => typeof value === 'string'
    );

    return hasErrors;
  };

  _submit = () => {
    const { email, password, name, family_name } = this.state;
    this.setState(
      {
        errors: {
          email:
            !email.length || !emailRegex.test(email)
              ? 'InvalidEmailFormat'
              : false,
          password:
            !password.length || !passwordRegex.test(password)
              ? 'InvalidPasswordFormat'
              : false,
          name: !name.length ? 'InvalidLength' : false,
          family_name: !family_name.length ? 'InvalidLength' : false,
        },
      },
      () => (!this._formHasErrors() ? this._signUp() : null)
    );
  };

  _renderAnchor = () => (
    <Label
      marginTop="15px"
      color="#fff"
      fontSize="15px"
      cursor="pointer"
      onClick={this._handleStateChange('signIn')}
      data-test="anchor-to-signin"
    >
      Already have an account?
    </Label>
  );

  render() {
    const { authState } = this.props;
    const {
      email,
      password,
      name,
      family_name,
      city,
      country,
      error,
      errors,
    } = this.state;
    if (authState !== 'signUp') {
      return null;
    }
    return (
      <Card
        title="Sign up"
        titleDataTest="signup-title"
        btnSubmitLabel="Sign up"
        btnDataTest="signup-button"
        Anchor={this._renderAnchor()}
        onSubmit={this._submit}
      >
        {error && <Error>* {error}</Error>}
        <Input
          required
          type="email"
          placeholder="email"
          value={email}
          autoComplete="current-email"
          error={errors.email}
          onChange={this._onTextInputChange('email')}
          dataTest="email-input-signup"
        />
        <Input
          required
          type="password"
          placeholder="password"
          value={password}
          autoComplete="current-password"
          error={errors.password}
          onChange={this._onTextInputChange('password')}
          dataTest="password-input-signup"
        />

        <Input
          required
          placeholder="First name"
          value={name}
          autoComplete="first-name"
          error={errors.name}
          onChange={this._onTextInputChange('name')}
          dataTest="firstname-input-signup"
        />
        <Input
          required
          placeholder="Last name"
          value={family_name}
          autoComplete="last-name"
          error={errors.family_name}
          onChange={this._onTextInputChange('family_name')}
          dataTest="lastname-input-signup"
        />
        <Input
          placeholder="City"
          value={city}
          autoComplete="current-city"
          error={errors.city}
          onChange={this._onTextInputChange('city')}
          dataTest="city-input-signup"
        />
        <Input
          placeholder="Country"
          value={country}
          autoComplete="country"
          error={errors.country}
          onChange={this._onTextInputChange('country')}
          dataTest="country-input-signup"
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

SignUp.propTypes = {
  authState: PropTypes.string,
  onStateChange: PropTypes.func,
};

export default SignUp;
