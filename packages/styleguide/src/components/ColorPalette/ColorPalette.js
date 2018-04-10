import React from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';

import Swatch from './Swatch';

import scssConfig from '!!sass-extract-loader!./../../style/app-config.scss'; //eslint-disable-line
console.log(scssConfig);

const scssColorPaletteVar = '$color-palette';
const defaultShade = '500';

const colors = scssConfig.global[scssColorPaletteVar].value;

export default class ColorPalette extends React.Component {
  static displayName = 'ColorPalette';

  static propTypes = {
    themeName: string
  };

  state = {
    currentShade: null
  };

  componentWillMount() {
    this.setState({
      currentShade: this.getDefaultShade()
    });
  }

  getColor() {
    const { themeName } = this.props;
    return colors[themeName];
  }

  getSwatches() {
    const color = this.getColor();
    if (color && color.type === 'SassMap') {
      return color.value;
    }
    return [];
  }

  getDefaultShade() {
    const color = this.getColor();

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
    const color = this.getColor();

    if (shade) {
      return color.value[shade].value.hex;
    }
    return color.value.hex;
  }

  handleColorChange(e, shade) {
    this.setState({ currentShade: shade });
  }

  render() {
    const { className, children, themeName, ...other } = this.props;

    const colorSwatches = this.getSwatches();

    const swatches = Object.entries(colorSwatches).map(([shade]) => (
      <Swatch
        key={shade}
        theme={themeName}
        shade={shade}
        color={this.getBackroundColor(shade)}
        isActive={shade === this.state.currentShade}
        onClick={e => this.handleColorChange(e, shade)}
      />
    ));

    return !this.getColor() ? (
      <p>{themeName} is not defined in color palette.</p>
    ) : (
      <StyledColorPalette
        className={className}
        {...other}
        style={{ backgroundColor: this.getBackroundColor() }}
      >
        <StyledColorInfo>
          {themeName}{' '}
          {swatches.length > 0
            ? `${this.state.currentShade} ${
                colors[themeName].value[this.state.currentShade].value.hex
              }`
            : colors[themeName].value.hex}
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
`;

const StyledColorInfo = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  background: white;
  padding: 3px 6px;
`;

const StyledSwatches = styled.div`
  display: flex;
  padding: 50px 0 0 0;
  overflow-x: auto;
  overflow-y: visible;
`;

const StyledSwatchSpacer = styled.div`
  height: 1px;
  flex: 0 0 24px;
`;
