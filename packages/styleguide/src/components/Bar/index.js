import styled from 'styled-components';
import { bool, string } from 'prop-types';

export const BarItem = styled.div`
  flex: 0 0 auto;
  min-width: 0%;
  align-items: center;
  margin-top: ${props => props.theme.spaces.tiny};
  margin-right: ${props => props.theme.spaces[props.space]};

  &:last-child {
    margin-right: 0;
  }

  & > *:last-child {
    margin-bottom: 0;
  }

  ${props =>
    props.fill &&
    `
    flex: 1 0 1px;
  `};

  ${props =>
    props.shrink &&
    `
    flex-shrink: 1;
  `};
`;

BarItem.propTypes = {
  fill: bool,
  shrink: bool,
  space: string
};

BarItem.defaultProps = {
  space: 'small'
};

export const Bar = styled.div`
  display: flex;
  flex-flow: row;
  flex-wrap: wrap;
  align-items: center;

  margin-top: -${props => props.theme.spaces.tiny};
  margin-bottom: ${props => props.theme.spaces[props.space]};

  & & {
    margin-bottom: 0;
  }
`;

Bar.propTypes = {
  space: string
};

Bar.defaultProps = {
  space: 'medium'
};
