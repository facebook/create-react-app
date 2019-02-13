import React from 'react';
import styled from 'styled-components';
import { Spinner } from '.';

const ButtonComponent = ({
  onClick,
  marginTop = 0,
  marginRight = 0,
  dataTest,
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
    data-testid={dataTest}
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
  padding: ${props => props.padding};
  margin-block-start: ${props => props.marginTop};
  margin-inline-end: ${props => props.marginRight};
  height: ${props => props.height};
  width: ${props => props.width};
  background-color: ${props => props.backgroundColor};
  border-radius: ${props => props.borderRadius};

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
