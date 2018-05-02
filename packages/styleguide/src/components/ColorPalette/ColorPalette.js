import React from 'react';
import { string, object } from 'prop-types';
import styled from 'styled-components';

import Swatch from './Swatch';

const defaultShade = '500';

export default class ColorPalette extends React.Component {
  static displayName = 'ColorPalette';

  static propTypes = {
    color: object,
    name: string
  };

  state = {
    currentShade: null
  };

  componentWillMount() {
    this.setState({
      currentShade: this.getDefaultShade()
    });
  }

  getSwatches() {
    const { color } = this.props;
    if (color && color.type === 'SassMap') {
      return color.value;
    }
    return [];
  }

  getDefaultShade() {
    const { color } = this.props;

    if (color && color.type === 'SassMap') {
      let shade = defaultShade;
      if (!Object.prototype.hasOwnProperty.call(color.value, defaultShade)) {
        [shade] = Object.keys(color.value);
      }
      return shade;
    }

    return null;
  }

  getBackroundColor(shade = this.state.currentShade) {
    const { color } = this.props;

    if (shade) {
      return color.value[shade].value.hex;
    }
    return color.value.hex;
  }

  handleColorChange(e, shade) {
    this.setState({ currentShade: shade });
  }

  render() {
    const { children, name, color, ...other } = this.props;

    const colorSwatches = this.getSwatches();

    const swatches = Object.entries(colorSwatches).map(([shade]) => (
      <Swatch
        key={shade}
        shade={shade}
        color={this.getBackroundColor(shade)}
        isActive={shade === this.state.currentShade}
        onClick={e => this.handleColorChange(e, shade)}
      />
    ));

    return (
      <StyledColorPalette
        {...other}
        style={{ backgroundColor: this.getBackroundColor() }}
      >
        <StyledColorInfo>
          {name}{' '}
          {swatches.length > 0
            ? `${this.state.currentShade} ${
                color.value[this.state.currentShade].value.hex
              }`
            : color.value.hex}
        </StyledColorInfo>

        {swatches.length > 0 && (
          <StyledSwatches>
            <StyledSwatchSpacer />
            {swatches}
            <StyledSwatchSpacer />
          </StyledSwatches>
        )}
      </StyledColorPalette>
    );
  }
}

const StyledColorPalette = styled.div`
  position: relative;
  width: 100%;
  margin: 0;
  padding: 150px 0 0;
  list-style-type: none;
  transition: background ease-out 200ms;
  font-family: ${props => props.theme.fontFamily};

  &:last-of-type {
    margin-bottom: ${props => props.theme.spaces.default};
  }
`;

const StyledColorInfo = styled.div`
  position: absolute;
  top: ${props => props.theme.spaces.medium};
  left: ${props => props.theme.spaces.medium};
  background: white;
  padding: ${props => props.theme.spaces.tiny};
`;

const StyledSwatches = styled.div`
  display: flex;
  padding: ${props => props.theme.spaces.large} 0 0 0;
  overflow-x: auto;
  overflow-y: visible;
`;

const StyledSwatchSpacer = styled.div`
  height: 1px;
  flex: 0 0 ${props => props.theme.spaces.medium};
`;
