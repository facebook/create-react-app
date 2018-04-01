import React from 'react';
import { string } from 'prop-types';

import Badge from './Badge';

const typeToColorMap = {
  ready: 'oxley',
  wip: 'wildRice',
  deprecated: 'froly',
  draft: 'whiskey',
  boosted: 'theme',
  custom: 'malibu',
  universal: 'olivine',
  react: 'portage',
  html: 'coralTree'
};

const propTypes = {
  value: string
};

const InfoBadge = ({ value, ...other }) => (
  <Badge color={typeToColorMap[value]} {...other}>
    {value}
  </Badge>
);

InfoBadge.propTypes = propTypes;
InfoBadge.displayName = 'InfoBadge';

export default InfoBadge;
