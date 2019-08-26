import React from 'react';

import { Bar, BarItem } from '../../Bar';

import Tooltip from './Tooltip';

import InteractContext from './state';

const PropLabelWithTooltip = ({ isDisabled, inputProps, componentInfo }) => (
  <Bar space="tiny">
    <BarItem>
      <PropLabel
        {...inputProps}
        {...(isDisabled ? { style: { color: 'grey' } } : {})}
      />
    </BarItem>
    <BarItem>
      <PropTooltip {...componentInfo} />
    </BarItem>
  </Bar>
);

const PropLabel = ({ id, name, input, ...other }) => (
  <label htmlFor={id} {...other}>
    {input} <strong>{name.replace(/^\w/, m => m.toUpperCase())}</strong>
  </label>
);

const PropTooltip = ({ id, name }) => (
  <InteractContext.Consumer>
    {({ docgen }) => {
      const propInfo = docgen.liveProps[id][name];
      return (
        <Tooltip
          dialog={propInfo.description || 'No valuable description found'}
        >
          i
        </Tooltip>
      );
    }}
  </InteractContext.Consumer>
);

export default PropLabelWithTooltip;
