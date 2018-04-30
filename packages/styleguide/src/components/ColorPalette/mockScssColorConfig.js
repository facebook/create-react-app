export default {
  global: {
    '$color-palette': {
      type: 'SassMap',
      value: {
        primary: {
          type: 'SassColor',
          value: {
            hex: '#ff5722'
          }
        },
        secondary: {
          type: 'SassColor',
          value: {
            hex: '#21a2ff'
          }
        },
        error: {
          type: 'SassMap',
          value: {
            '50': {
              type: 'SassColor',
              value: {
                hex: '#fff5f5'
              }
            },
            '100': {
              type: 'SassColor',
              value: {
                hex: '#ffe3e3'
              }
            },
            '300': {
              type: 'SassColor',
              value: {
                hex: '#ff6b6b'
              }
            },
            '500': {
              type: 'SassColor',
              value: {
                hex: '#fa5252'
              }
            }
          }
        },
        success: {
          type: 'SassMap',
          value: {
            '300': {
              type: 'SassColor',
              value: {
                hex: '#3adb76'
              }
            }
          }
        },
        grey: {
          type: 'SassColor',
          value: {
            hex: '#adb5bd'
          }
        }
      }
    }
  }
};
