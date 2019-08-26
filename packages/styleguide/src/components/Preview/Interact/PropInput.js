import React from 'react';
import styled from 'styled-components';

import { is } from './helpers';

import PropLabelWithTooltip from './PropLabelWithTooltip';

import InteractContext from './state';

const PropInput = ({ type, isDisabled, inputProps, componentInfo }) => (
  <InteractContext.Consumer>
    {({ state, handleInputChange }) => {
      const { id, name } = componentInfo;
      let value = state.liveProps[id][name];

      return (
        <React.Fragment>
          <PropLabelWithTooltip
            isDisabled={isDisabled}
            inputProps={inputProps}
            componentInfo={componentInfo}
          />
          {isDisabled ? (
            <Input
              {...inputProps}
              disabled
              value={
                is(typeof value, 'object')
                  ? JSON.stringify(value)
                  : value.toString()
              }
            />
          ) : (
            <Input
              {...inputProps}
              value={value}
              onChange={e => {
                handleInputChange(type, e);
              }}
            />
          )}
        </React.Fragment>
      );
    }}
  </InteractContext.Consumer>
);

const Input = styled.input`
  display: block;
  font-size: 16px;
  color: ${props => props.theme.colors.black};
  line-height: 1.3;
  padding: 0.3em 1.4em 0.2em 0.5em;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0;
  border: 1px solid ${props => props.theme.colors.greyDark};
  border-radius: 0.3em;
  appearance: none;
  background-color: ${props => props.theme.colors.white};

  :focus,
  :hover {
    border-color: ${props => props.theme.colors.greyDark};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export default PropInput;
