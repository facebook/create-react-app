module.exports = {
  parser: "babel-eslint",
  extends: ["airbnb", "prettier"],
  plugins: ["prettier"],
  rules: {
    "arrow-parens": ["error", "as-needed"],
    "comma-dangle": [
      2,
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "ignore"
      }
    ],
    "jsx-a11y/href-no-hash": "off",
    "jsx-a11y/anchor-is-valid": [
      "warn",
      {
        aspects: ["invalidHref"]
      }
    ],
    "jsx-a11y/label-has-for": [
      "error",
      {
        components: ["label"],
        required: {
          every: ["id"]
        }
      }
    ],
    "import/no-extraneous-dependencies": "off",
    "no-unused-vars": [
      "warn",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true
      }
    ],
    "prettier/prettier": [
      "error",
      {
        trailingComma: "es5",
        singleQuote: true
      }
    ],
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".js", ".jsx"]
      }
    ],
    "react/prop-types": [
      2,
      {
        ignore: ["className", "children", "style"]
      }
    ],
    "react/require-default-props": 0,
    "react/forbid-prop-types": [
      2,
      {
        forbid: ["any"]
      }
    ],
    "react/jsx-wrap-multilines": "off"
  },
  globals: {
    window: true
  },
  env: {
    browser: true
  },
  parserOptions: {
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  }
};
