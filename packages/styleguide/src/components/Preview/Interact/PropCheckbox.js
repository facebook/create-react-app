import React from 'react';

import InteractContext from './state';

import PropLabelWithTooltip from './PropLabelWithTooltip';

const PropCheckbox = ({ inputProps, componentInfo }) => {
  const { id, name } = componentInfo;

  return (
    <InteractContext.Consumer>
      {({ state, handleCheckboxChange }) => (
        <PropLabelWithTooltip
          inputProps={{
            ...inputProps,
            input: (
              <input
                {...inputProps}
                type="checkbox"
                checked={state.liveProps[id][name] ? 'checked' : false}
                onChange={handleCheckboxChange}
              />
            ),
          }}
          componentInfo={componentInfo}
        />
      )}
    </InteractContext.Consumer>
  );
};

export default PropCheckbox;
