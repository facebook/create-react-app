import React from 'react';
import styled, { withTheme } from 'styled-components';
import { node, object } from 'prop-types';
import cx from 'classnames';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';

import { Bar, BarItem } from './../Bar';

import * as theme from './../../style/theme';
import { rem } from '../../style/utils';

const CLASS_ROOT = 'sg-header';

const propTypes = {
  project: node,
  projectSmall: node,
  theme: object,
};

const Header = ({
  className,
  project,
  projectSmall,
  children,
  theme,
  ...other
}) => {
  const classes = cx(CLASS_ROOT, className);

  const getLogo = matches => (
    <StyledLink to="/">{matches ? project : projectSmall}</StyledLink>
  );

  return (
    <StyledBar className={classes} {...other}>
      {children && <BarItem shrink>{children}</BarItem>}
      <BarItem isFilling shrink>
        <MediaQuery minDeviceWidth={theme.breakpoints.m}>
          {matches =>
            typeof project === 'string' ? (
              <StyledProjectText>{getLogo(matches)}</StyledProjectText>
            ) : (
              <StyledProjectLogo>{getLogo(matches)}</StyledProjectLogo>
            )
          }
        </MediaQuery>
      </BarItem>
    </StyledBar>
  );
};

const StyledLink = styled(Link)`
  color: ${props => props.theme.colors.black};
  text-decoration: none;

  &:visited {
    ${props => props.theme.colors.black};
  }
`;

StyledLink.defaultProps = {
  theme,
};

const StyledBar = styled(Bar)`
  font-family: ${props => props.theme.fontFamily};
`;

StyledBar.defaultProps = {
  theme,
};

const StyledProjectText = styled('div')`
  font-size: ${rem(24)};
  font-weight: 700;

  @media (min-width: ${props => props.theme.breakpoints.s}) {
    font-size: ${rem(36)};
  }
`;

StyledProjectText.defaultProps = {
  theme,
};

const StyledProjectLogo = styled('div')`
  img {
    height: ${rem(35)};
    margin-bottom: ${props => rem(props.theme.spaces.tiny)};

    @media (min-width: ${props => props.theme.breakpoints.m}) {
      height: ${rem(50)};
      margin-bottom: 0;
    }
  }
`;

StyledProjectLogo.defaultProps = {
  theme,
};

Header.displayName = 'Header';
Header.propTypes = propTypes;
Header.defaultProps = {
  theme,
};

export default withTheme(Header);
