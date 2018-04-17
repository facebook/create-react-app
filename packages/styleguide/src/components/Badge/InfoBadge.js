import React from 'react';
import { string, object } from 'prop-types';

import Badge from './Badge';

let defaultTypeToColorMap = {
  ready: 'oxley',
  wip: 'wildRice',
  deprecated: 'froly',
  draft: 'whiskey',
  custom: 'malibu',
  universal: 'olivine',
  react: 'portage',
  html: 'coralTree'
};

const propTypes = {
  value: string,
  typeToColorMap: object
};

const InfoBadge = ({
  value,
  typeToColorMap = defaultTypeToColorMap,
  ...other
}) => {
  const localTypeToColorMap = { ...defaultTypeToColorMap, ...typeToColorMap };

  return (
    <Badge color={localTypeToColorMap[value]} {...other}>
      {value}
    </Badge>
  );
};

InfoBadge.propTypes = propTypes;
InfoBadge.displayName = 'InfoBadge';

export default InfoBadge;
export { propTypes };
