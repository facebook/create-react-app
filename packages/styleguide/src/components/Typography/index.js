import styled, { css } from 'styled-components';
import { rem } from './../../style';
import * as theme from './../../style/theme';

const baseCSS = theme =>
  css`
    font-family: ${theme.fontFamily};
    font-weight: ${theme.fontWeights.bold};
    color: ${theme.colors.black};
    margin-top: 0;
    margin-bottom: ${theme.spaces.medium};
    max-width: ${theme.contentWidth};
  `;

export const H1 = styled.h1`
  ${props => baseCSS(props.theme)}
  font-size: ${rem(54)};
  line-height: 1.3333;
  margin-bottom: ${props => props.theme.spaces.large};
`;
H1.displayName = 'H1';
H1.defaultProps = {
  theme,
};

export const H2 = styled.h2`
  ${props => baseCSS(props.theme)}
  font-size: ${rem(36)};
  line-height: 1.3333;
`;
H2.displayName = 'H2';
H2.defaultProps = {
  theme,
};

export const H3 = styled.h3`
  ${props => baseCSS(props.theme)}
  font-size: ${rem(24)};
  line-height: 1.3333;
`;
H3.displayName = 'H3';
H3.defaultProps = {
  theme,
};

export const H4 = styled.h4`
  ${props => baseCSS(props.theme)}
  font-size: ${props => rem(props.theme.fontSizes.base)};
  line-height: ${props => props.theme.lineHeights.base};
`;
H4.displayName = 'H4';
H4.defaultProps = {
  theme,
};

export const H5 = styled.h5`
  ${props => baseCSS(props.theme)}
  color: ${props => props.theme.colors.greyDark};
  font-size: ${props => rem(props.theme.fontSizes.base)};
  line-height: ${props => props.theme.lineHeights.base};
  text-transform: uppercase;
`;
H5.displayName = 'H5';
H5.defaultProps = {
  theme,
};

export const P = styled.p`
  font-family: ${props => props.theme.fontFamily};
  color: ${props => props.theme.colors.black};
  line-height: ${props => props.theme.lineHeights.base};
  margin-top: 0;
  margin-bottom: ${props => props.theme.spaces.medium};
  max-width: ${props => props.theme.contentWidth};
`;
P.displayName = 'P';
P.defaultProps = {
  theme,
};

export const Link = styled.a`
  font-family: ${props => props.theme.fontFamily};
  color: ${props => props.theme.colors.accent};
  line-height: ${props => props.theme.lineHeights.base};

  &:focus,
  &:hover {
    text-decoration: none;
  }
`;
Link.displayName = 'Link';
Link.defaultProps = {
  theme,
};
