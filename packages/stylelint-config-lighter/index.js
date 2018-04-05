module.exports = {
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-sass-guidelines",
  ],
  "plugins": [
    "stylelint-scss"
  ],
  "rules": {
    "at-rule-empty-line-before": [
      "always",
      {
        "except": [
          "blockless-after-same-name-blockless",
          "first-nested"
        ],
        "ignore": ["after-comment"],
        "ignoreAtRules": ["else", "elseif"]
      }
    ],
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "extend", "at-root", "debug", "warn", "error", "if", "else", "for", "each", "while", "mixin", "include", "content", "return", "function"
        ]
      }
    ],
    "block-closing-brace-newline-after": [
      "always",
      {
        "ignoreAtRules": ["if", "else", "elseif"]
      }
    ],
    "color-named": [
      "never",
      {
        "ignore": [
          "inside-function"
        ]
      }
    ],
    "declaration-empty-line-before": null,
    "max-nesting-depth": [
      2,
      {
        "ignore": [
          "blockless-at-rules"
        ]
      }
    ],
    "media-query-list-comma-newline-after": null,
    "no-extra-semicolons": null, // this is buggy with scss
    "order/properties-alphabetical-order": null,
    "scss/at-import-no-partial-leading-underscore": null,
    "scss/at-function-pattern": "^[_a-z]+([a-z0-9-]+[a-z0-9]+)?$",
    "selector-class-pattern": null,
    "selector-no-qualifying-type": [
      true,
      {
        "ignore": [
          "attribute",
          "class"
        ]
      }
    ],
  }
}
