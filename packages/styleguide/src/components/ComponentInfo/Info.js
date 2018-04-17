import React from 'react';
import { arrayOf, string } from 'prop-types';

import InfoBadge from './../Badge/InfoBadge';

import { Bar, BarItem } from './../Bar';

const propTypes = {
  values: arrayOf(string),
  what: string
};

const Info = ({ values = [], what, ...other }) => (
  <Bar {...other}>
    {what && <BarItem>{what}</BarItem>}
    <BarItem>
      <Bar>
        {values.map(value => (
          <BarItem space="tiny" key={value}>
            <InfoBadge value={value} {...other} />
          </BarItem>
        ))}
      </Bar>
    </BarItem>
  </Bar>
);

Info.propTypes = propTypes;

export default Info;
