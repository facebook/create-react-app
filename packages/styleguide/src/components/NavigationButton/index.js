import React from 'react';
import styled from 'styled-components';
import { bool } from 'prop-types';
import cx from 'classnames';

import { rem } from './../../style/utils';

const propTypes = {
  isActive: bool,
  isMobileButton: bool
};

const NavigationButton = ({
  className,
  isActive,
  isMobileButton = false,
  ...other
}) => {
  const classes = cx({ 'is-active': isActive }, className);

  return (
    <StyledMenuButtonWrapper
      className={classes}
      isMobileButton={isMobileButton}
      {...other}
    >
      <StyledMenuButton>
        <StyledButtonLine />
        <StyledButtonLine />
        <StyledButtonLine />
      </StyledMenuButton>
    </StyledMenuButtonWrapper>
  );
};

const StyledMenuButtonWrapper = styled.a`
  display: inline-block;
  position: ${props => (props.isMobileButton ? 'absolute' : 'static')};
  right: ${props => (props.isMobileButton ? '40px' : '0')};
  top: ${props => (props.isMobileButton ? '24px' : '0')};
  margin-right: ${props =>
    props.isMobileButton ? '0' : rem(props.theme.spaces.medium)};

  &.is-active {
    > span {
      transform: rotate(180deg);
    }
    > span > span {
      opacity: 0;
      &:first-child {
        opacity: 1;
        transform: rotate(45deg);
      }
      &:last-child {
        opacity: 1;
        transform: rotate(-45deg);
      }
    }

    &:hover {
      > span > span {
        &:first-child,
        &:last-child {
          width: 25px;
        }
      }
    }
  }
  @media (min-width: ${props => props.theme.breakpoints.s}) {
    display: ${props => (props.isMobileButton ? 'none' : 'inline-block')};
  }
  @media (min-width: ${props => props.theme.breakpoints.l}) {
    display: none;
  }
`;

const StyledMenuButton = styled.span`
  width: 25px;
  height: 25px;
  position: relative;
  display: block;
  border: none;
  background-clip: padding-box;
  transition: transform 0.2s ease-in-out 0s;
  transform: rotate(0deg);

  &:hover {
    > span:first-child {
      transform: translateY(8px);
    }
    > span:last-child {
      transform: translateY(-8px);
    }
  }
`;

const StyledButtonLine = styled.span`
  display: block;
  width: 18px;
  height: 3px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  border-radius: 5px;
  background-color: ${props => props.theme.colors.greyDark};
  transition: all 0.2s ease-in-out 0s;
  transition-property: transform, opacity, width;

  &:first-child {
    transform: translateY(6px);
  }

  &:last-child {
    transform: translateY(-6px);
  }
`;

NavigationButton.displayName = 'NavigationButton';
NavigationButton.propTypes = propTypes;

export default NavigationButton;
