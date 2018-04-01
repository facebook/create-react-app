/* eslint-disable import/prefer-default-export */
import { css } from 'styled-components';
import { rem } from './utils';

export const ButtonBaseCSS = css`
  display: inline-block;
  min-height: ${rem(24)};
  margin-bottom: ${props => props.theme.spaces.small};
  padding: 0 ${props => props.theme.spaces.small};
  vertical-align: middle;
  text-align: center;
  cursor: pointer;
  appearance: none;
  border: 0px solid transparent;
  background: transparent;
  font-family: ${props => props.theme.fontFamily};
  font-weight: ${props => props.theme.fontWeights.bold};
  font-size: ${props => props.theme.fontSizes.small};
  color: ${props => props.theme.colors.black};

  .icon {
    margin-right: 1em;
    margin-top: -2px;
  }
`;
