import React from 'react';
import styled from 'styled-components';

import InteractContext from './state';

import PropFormField from './PropFormField';

const PropsGroup = ({ id, showId }) => (
  <InteractContext.Consumer>
    {({ state, props, docgen }) => {
      const statePropNames = Object.keys(docgen.liveProps[id]);
      const propCount = statePropNames.length;

      return (
        state.showProps[showId || id] && (
          <StyledGroup>
            {propCount ? (
              statePropNames.map((name, index) => {
                return props.filterProps.find(
                  filtered => filtered === name
                ) ? null : (
                  <PropFormField key={index.toString()} {...{ id, name }} />
                );
              })
            ) : (
              <p>There are no props to edit, try another component!</p>
            )}
          </StyledGroup>
        )
      );
    }}
  </InteractContext.Consumer>
);

const StyledGroup = styled.div`
  width: 90%;
  box-sizing: border-box;
  position: relative;
  margin-bottom: 1em;

  & > * + * {
    margin-top: 1em;
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -20px;
    left: -1px;
    height: 20px;
    width: 0;
  }
`;

export default PropsGroup;
