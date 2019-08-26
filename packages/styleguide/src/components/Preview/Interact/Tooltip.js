import React from 'react';
import styled from 'styled-components';

const Tooltip = ({ children, dialog, ...other }) => (
  <StyledTooltip {...other}>
    <div className="tooltip-trigger">{children}</div>
    <div className="tooltip-title">{dialog}</div>
  </StyledTooltip>
);

const StyledTooltip = styled.div`
  position: relative;
  color: ${props => props.theme.colors.white};

  .tooltip-title {
    pointer-events: none;
    position: absolute;
    width: 200px;
    text-align: center;
    padding: ${props => props.theme.spaces.small};
    background: black;
    border-radius: ${props => props.theme.spaces.tiny};
    left: 0;
    top: 50%;
    transform: translate(-105%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease-in 0.1s;

    ::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translate(100%, -50%);
      border-style: solid;
      border-width: 6px 0 6px 8px;
      border-color: transparent transparent transparent
        ${props => props.theme.colors.black};
    }
  }

  .tooltip-trigger:hover + .tooltip-title {
    opacity: 1;
  }

  .tooltip-trigger {
    background: ${props => props.theme.colors.portage};
    color: ${props => props.theme.colors.white};
    font-weight: bold;
    text-align: center;
    font-size: 14px;
    line-height: 16px;
    height: 16px;
    width: 16px;
    margin: 0;
    border-radius: 50%;
  }
`;

export default Tooltip;
