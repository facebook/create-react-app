# eslint-config-react-app

This package includes the shareable ESLint configuration used by [Create React App](https://github.com/facebook/create-react-app).<br>
Please refer to its documentation:

- [Getting Started](https://facebook.github.io/create-react-app/docs/getting-started) – How to create a new app.
- [User Guide](https://facebook.github.io/create-react-app/) – How to develop apps bootstrapped with Create React App.

## Usage in Create React App Projects

The easiest way to use this configuration is with [Create React App](https://github.com/facebook/create-react-app), which includes it by default.

**You don’t need to install it separately in Create React App projects.**

## Usage Outside of Create React App

If you want to use this ESLint configuration in a project not built with Create React App, you can install it with the following steps.

First, install this package, ESLint and the necessary plugins.

```sh
npm install --save-dev eslint-config-react-app @typescript-eslint/eslint-plugin@2.x @typescript-eslint/parser@2.x babel-eslint@10.x eslint@6.x eslint-plugin-flowtype@4.x eslint-plugin-import@2.x eslint-plugin-jsx-a11y@6.x eslint-plugin-react@7.x eslint-plugin-react-hooks@2.x
```

Then create a file named `.eslintrc.json` with following contents in the root folder of your project:

```json
{
  "extends": "react-app"
}
```

That's it! You can override the settings from `eslint-config-react-app` by editing the `.eslintrc.json` file. Learn more about [configuring ESLint](http://eslint.org/docs/user-guide/configuring) on the ESLint website.

## Accessibility Checks

By default, this configuration extends the [eslint-plugin-jsx-a11y](https://github.com/evcohen/eslint-plugin-jsx-a11y) _strict_ configuration. As one of the leading React developer tools, this set of rules will encourage developers to create more accessible web applications from the start!

If you'd like to learn more about accessibility on the web visit these resources:

- [Introduction to Web Accessibility](https://www.w3.org/WAI/fundamentals/accessibility-intro/) by W3C Web Accessibility Initiative
- [What is accessibility?](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/What_is_accessibility) by MDN web docs
- [React aXe](https://github.com/dequelabs/react-axe) accessibility and compliance tool by [deque](https://www.deque.com/axe/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse/) web application auditing tool by Google

You can override any of the accessibility rules by adding them to the `"rules"` section of your `.eslintrc` file. For example, if you want to change the [anchor-has-content](https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/anchor-has-content.md) rule to `"warn"`, you would add the following code:

```json
{
  "rules": {
    "jsx-a11y/anchor-has-content": "warn"
  }
}
```

However, if you are using [Create React App](https://github.com/facebook/create-react-app) and have not ejected, any additional rules will only be displayed in the [IDE integrations](https://facebook.github.io/create-react-app/docs/setting-up-your-editor#displaying-lint-output-in-the-editor), but not in the browser or the terminal.
