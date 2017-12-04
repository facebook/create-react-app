'use strict';

module.exports = [
  {
    // Must be first
    properties: ['all'],
  },
  {
    // Display and box model
    properties: [
      'display',
      'box-sizing',
      'overflow',
      'width',
      'height',
      'min-width',
      'min-height',
      'max-width',
      'max-height',
      'padding',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'padding-block-start',
      'padding-block-end',
      'padding-inline-start',
      'padding-inline-end',
      'border',
      'border-top',
      'border-right',
      'border-bottom',
      'border-left',
      'border-width',
      'border-top-width',
      'border-right-width',
      'border-bottom-width',
      'border-left-width',
      'border-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'border-style',
      'border-top-style',
      'border-right-style',
      'border-bottom-style',
      'border-left-style',
      'border-image',
      'border-image-source',
      'border-image-width',
      'border-image-outset',
      'border-image-repeat',
      'border-image-slice',
      'border-radius',
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-left-radius',
      'border-bottom-right-radius',
      'margin',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'margin-block-start',
      'margin-block-end',
      'margin-inline-start',
      'margin-inline-end',
    ],
  },
  {
    // Positioning
    properties: [
      'position',
      'top',
      'right',
      'bottom',
      'left',
      'vertical-align',
    ],
  },
  {
    // Float
    properties: ['float', 'clear'],
  },
  {
    // Flexbox
    properties: [
      'flex',
      'flex-basis',
      'flex-direction',
      'flex-flow',
      'flex-grow',
      'flex-shrink',
      'flex-wrap',
    ],
  },
  {
    // Grid
    properties: [
      'grid',
      'grid-area',
      'grid-template',
      'grid-template-areas',
      'grid-template-rows',
      'grid-template-columns',
      'grid-row',
      'grid-row-start',
      'grid-row-end',
      'grid-column',
      'grid-column-start',
      'grid-column-end',
      'grid-auto-rows',
      'grid-auto-columns',
      'grid-auto-flow',
      'grid-gap',
      'grid-row-gap',
      'grid-column-gap',
    ],
  },
  {
    // Align
    properties: ['align-content', 'align-items', 'align-self'],
  },
  {
    // Justify
    properties: ['justify-content', 'justify-items', 'justify-self'],
  },
  {
    // Order
    properties: ['order'],
  },
  {
    // Columns
    properties: [
      'columns',
      'column-gap',
      'column-fill',
      'column-rule',
      'column-rule-width',
      'column-rule-style',
      'column-rule-color',
      'column-span',
      'column-count',
      'column-width',
    ],
  },
  {
    // Transform
    properties: [
      'transform',
      'transform-origin',
      'transform-box',
      'transform-style',
      'transform-function',
      'backface-visibility',
      'perspective',
      'perspective-origin',
    ],
  },
  {
    // Visibility
    properties: ['visibility', 'opacity', 'z-index'],
  },
  {
    // Style
    properties: [
      'color',
      'background',
      'background-color',
      'background-image',
      'background-repeat',
      'background-position',
      'background-size',
      'background-attachment',
      'background-clip',
      'background-origin',
      'background-blend-mode',
      'outline',
      'outline-width',
      'outline-color',
      'outline-style',
      'outline-offset',
      'box-shadow',
    ],
  },
  {
    // Lists
    properties: [
      'list-style',
      'list-style-type',
      'list-style-position',
      'list-style-image',
      'caption-side',
    ],
  },
  {
    // Tables
    properties: [
      'table-layout',
      'border-collapse',
      'border-spacing',
      'empty-cells',
    ],
  },
  {
    // Font
    properties: [
      'font',
      'font-family',
      'font-size',
      'font-size-adjust',
      'font-style',
      'font-weight',
      'font-smoothing',
      'font-synthesis',
      'font-kerning',
      'font-stretch',
      'font-variant',
      'font-variant-caps',
      'font-variant-numeric',
      'font-variant-position',
      'font-variant-ligatures',
      'font-variant-alternates',
      'font-variant-east-asian',
      'font-language-override',
      'font-feature-settings',
    ],
  },
  {
    // Text alignment and decoration
    properties: [
      'direction',
      'tab-size',
      'text-align',
      'text-align-last',
      'text-justify',
      'text-indent',
      'text-transform',
      'text-decoration',
      'text-decoration-line',
      'text-decoration-color',
      'text-decoration-style',
      'text-rendering',
      'text-emphasis',
      'text-emphasis-color',
      'text-emphasis-style',
      'text-emphasis-position',
      'text-combine-upright',
      'text-underline-position',
      'text-orientation',
      'text-shadow',
      'text-overflow',
    ],
  },
  {
    // Text spacing
    properties: [
      'line-height',
      'word-spacing',
      'letter-spacing',
      'white-space',
      'word-break',
      'word-wrap',
    ],
  },
  {
    // Interactivity
    properties: [
      'transition',
      'transition-property',
      'transition-duration',
      'transition-timing-function',
      'transition-delay',
      'animation',
      'animation-name',
      'animation-duration',
      'animation-timing-function',
      'animation-direction',
      'animation-delay',
      'animation-iteration-count',
      'animation-fill-mode',
      'animation-play-state',
      'pointer-events',
      'cursor',
    ],
  },
  {
    // Content
    properties: ['content', 'quotes'],
  },
  {
    // Counters
    properties: ['counter-reset', 'counter-increment'],
  },
];
