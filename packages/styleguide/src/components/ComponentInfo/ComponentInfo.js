import React from 'react';
import { array } from 'prop-types';
import styled from 'styled-components';

import { Bar, BarItem } from '../Bar';

import Info from './Info';

const propTypes = {
  implementation: array,
  status: array
};

const ComponentInfo = ({ status, implementation }) => (
  <StyledComponentInfo>
    <Bar>
      {status && (
        <BarItem>
          <Info what="Status:" values={status} />
        </BarItem>
      )}
      {implementation && (
        <BarItem>
          <Info what="Implementation:" values={implementation} />
        </BarItem>
      )}
    </Bar>
  </StyledComponentInfo>
);

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
ComponentInfo.defaultName = 'ComponentInfo';

export default ComponentInfo;
