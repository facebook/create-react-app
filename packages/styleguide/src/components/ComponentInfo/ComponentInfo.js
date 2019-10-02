import React from 'react';
import { arrayOf, array, shape, string } from 'prop-types';
import styled from 'styled-components';

import { Bar, BarItem } from '../Bar';

import Info from './Info';
import { propTypes as BadgePropTypes } from './../Badge/InfoBadge';

const propTypes = {
  /** Array of types of info which will be displayed in row. */
  infoTypes: arrayOf(
    shape({
      /** Type label */
      label: string.isRequired,
      /** Array of values which will be displayed as InfoBadges */
      values: array,
    })
  ).isRequired,
  /** Default map of available colors to types. Color must be defined in theme. */
  typeToColorMap: BadgePropTypes.typeToColorMap,
};

const ComponentInfo = ({ infoTypes, typeToColorMap, ...other }) => {
  const infoItems = infoTypes.reduce((types, type) => {
    if (type.values) {
      types = [
        ...types,
        <BarItem key={type.label}>
          <Info
            what={type.label}
            values={type.values}
            typeToColorMap={typeToColorMap}
            {...other}
          />
        </BarItem>,
      ];
    }

    return types;
  }, []);

  return (
    <StyledComponentInfo>
      {infoItems && <Bar>{infoItems}</Bar>}
    </StyledComponentInfo>
  );
};

const StyledComponentInfo = styled.div`
  h1 + &,
  h2 + &,
  h3 + &,
  h4 + &,
  h5 + & {
    margin-top: -${props => props.theme.spaces.small};
  }
`;

ComponentInfo.propTypes = propTypes;
ComponentInfo.displayName = 'ComponentInfo';

export default ComponentInfo;
