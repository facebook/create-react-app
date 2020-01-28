import React from 'react';
import styled from 'styled-components';

import InteractContext from './state';

import PropLabelWithTooltip from './PropLabelWithTooltip';

import { cleanValue } from './helpers';

import * as theme from './../../../style/theme';

const PropSelect = ({ inputProps, componentInfo }) => {
  const { id, name } = componentInfo;

  return (
    <InteractContext.Consumer>
      {({ state, docgen, handleSelectChange }) => {
        const propInfo = docgen.liveProps[id][name];

        return (
          <React.Fragment>
            <PropLabelWithTooltip
              inputProps={inputProps}
              componentInfo={componentInfo}
            />
            <StyledSelect
              {...inputProps}
              value={state.liveProps[id][name]}
              onChange={handleSelectChange}
            >
              <option value="null">None</option>
              {Object.values(propInfo.type.value).map((option, index) => {
                const optionValue = cleanValue(option.value);
                return (
                  <option key={index.toString()} value={optionValue}>
                    {optionValue}
                  </option>
                );
              })}
            </StyledSelect>
          </React.Fragment>
        );
      }}
    </InteractContext.Consumer>
  );
};

const StyledSelect = styled.select`
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
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat, repeat;
  background-position: right 0.7em top 50%, 0 0;
  background-size: 0.65em auto, 100%;

  ::-ms-expand {
    display: none;
  }
  :hover {
    border-color: ${props => props.theme.colors.greyDark};
  }
  option {
    font-weight: normal;
  }
`;

StyledSelect.defaultProps = {
  theme,
};

export default PropSelect;
