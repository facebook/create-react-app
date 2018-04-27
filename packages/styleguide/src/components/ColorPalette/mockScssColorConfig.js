export default {
  global: {
    '$color-palette': {
      type: 'SassMap',
      value: {
        primary: {
          type: 'SassColor',
          value: {
            r: 255,
            g: 87,
            b: 34,
            a: 1,
            hex: '#ff5722'
          }
        },
        secondary: {
          type: 'SassColor',
          value: {
            r: 33,
            g: 162,
            b: 255,
            a: 1,
            hex: '#21a2ff'
          }
        },
        error: {
          type: 'SassMap',
          value: {
            '50': {
              type: 'SassColor',
              value: {
                r: 255,
                g: 245,
                b: 245,
                a: 1,
                hex: '#fff5f5'
              }
            },
            '100': {
              type: 'SassColor',
              value: {
                r: 255,
                g: 227,
                b: 227,
                a: 1,
                hex: '#ffe3e3'
              }
            },
            '300': {
              type: 'SassColor',
              value: {
                r: 255,
                g: 107,
                b: 107,
                a: 1,
                hex: '#ff6b6b'
              }
            },
            '500': {
              type: 'SassColor',
              value: {
                r: 250,
                g: 82,
                b: 82,
                a: 1,
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
                r: 58,
                g: 219,
                b: 118,
                a: 1,
                hex: '#3adb76'
              }
            }
          }
        },
        grey: {
          type: 'SassColor',
          value: {
            r: 173,
            g: 181,
            b: 189,
            a: 1,
            hex: '#adb5bd'
          }
        }
      },
      sources: [
        '/Users/adam/Praca/lighter/packages/styleguide/src/style/app-config.scss'
      ],
      declarations: [
        {
          expression:
            '(\n  primary: #ff5722,\n  secondary: #21a2ff,\n  error: (\n    500: #fa5252,\n    50:  #fff5f5,\n    100: #ffe3e3,\n    300: #ff6b6b,\n  ),\n  success: ( 300: #3adb76, ),\n  grey: #adb5bd,\n)',
          flags: {
            default: false,
            global: false
          },
          in:
            '/Users/adam/Praca/lighter/packages/styleguide/src/style/app-config.scss',
          position: {
            line: 6,
            column: 1
          }
        }
      ]
    }
  }
};
