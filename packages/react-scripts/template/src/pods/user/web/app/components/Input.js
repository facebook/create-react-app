import React, { Fragment } from 'react';
import styled from 'styled-components';

import Label from './Label';

const InputComponent = ({
  type,
  placeholder,
  autoComplete,
  value,
  onChange,
  disabled,
  required,
  error,
  dataTest
}) => {
  const _errorMessage = () => {
    switch (error) {
      case 'InvalidEmailFormat':
        return 'Please input a valid email format (e.g. hello@ivory.com)';
      case 'InvalidPasswordFormat':
        return 'Please input a valid password format (Minimum 8 characters, an uppercase, a digit and a special character)';
      case 'InvalidLength':
        return 'Please make sure your input is valid.';

      default:
        return 'Something went wrong.';
    }
  };
  return (
    <Fragment>
      <Input
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        required={required}
        disabled={disabled}
        onChange={onChange}
        error={error}
        data-test={dataTest}
      />
      {error && <Error>{_errorMessage()}</Error>}
    </Fragment>
  );
};

const Input = styled.input`
  width: calc(100% - 12px);
  height: 24px;
  margin-block-start: 6px;
  padding: 6px;
  border-radius: 6px;
  border: 1px solid ${props => (props.error ? 'red' : '#c3c3c3')};
  :focus {
    outline-style: none;
    outline-color: transparent;
  }
  ::placeholder {
    color: ${props => (props.error ? 'red' : '#484848')};
  }
`;

const Error = styled(Label)`
  width: calc(100% - 12px);
  font-size: 12px;
  margin: 4px 6px 6px;
  color: red;
`;

export default InputComponent;
