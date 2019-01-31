import React from 'react';
import styled from 'styled-components';
import { Spinner } from '.';

const ButtonComponent = ({
  onClick,
  marginTop = 0,
  marginRight = 0,
  padding,
  borderRadius,
  backgroundColor,
  isLoading,
  minWidth,
  width,
  height,
  disabled,
  label,
  ...rest
}) => (
  <Button
    onClick={onClick}
    marginTop={marginTop}
    marginRight={marginRight}
    padding={padding}
    borderRadius={borderRadius}
    minWidth={minWidth}
    height={height}
    width={width}
    disabled={disabled}
    backgroundColor={backgroundColor}
    {...rest}
  >
    {!isLoading ? label : <Spinner />}
  </Button>
);

const Button = styled.button`
  padding: ${props => props.padding}px;
  margin-block-start: ${props => props.marginTop}px;
  margin-inline-end: ${props => props.marginRight}px;
  height: ${props => props.height}px;
  width: ${props => props.width}px;
  background-color: ${props => props.backgroundColor};
  border-radius: ${props => props.borderRadius}px;

  :active {
    transform: scale(0.965);
  }
  :focus {
    outline-style: none;
    outline-color: transparent;
  }

  :disabled {
    opacity: 0.5;
    filter: grayscale(50%);
  }
`;

export default ButtonComponent;
