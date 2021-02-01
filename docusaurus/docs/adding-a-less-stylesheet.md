---
id: adding-a-less-stylesheet
title: Adding a Less Stylesheet
sidebar_label: Adding Less Stylesheets
---

> Note: this feature is available with `react-scripts@4.1.0` and higher.

Generally, we recommend that you don’t reuse the same CSS classes across different components. For example, instead of using a `.Button` CSS class in `<AcceptButton>` and `<RejectButton>` components, we recommend creating a `<Button>` component with its own `.Button` styles, that both `<AcceptButton>` and `<RejectButton>` can render (but [not inherit](https://facebook.github.io/react/docs/composition-vs-inheritance.html)).

Following this rule often makes CSS preprocessors less useful, as features like mixins and nesting are replaced by component composition. You can, however, integrate a CSS preprocessor if you find it valuable.

To use Less, first install `less`:

```sh
$ npm install less --save
$ # or
$ yarn add less
```

Now you can rename `src/App.css` to `src/App.less` and update `src/App.js` to import `src/App.less`.
This file and any other file will be automatically compiled if imported with the extension `.less`.

To share variables between Less files, you can use Less imports. For example, `src/App.less` and other component style files could include `@import "./shared.less";` with variable definitions.

This will allow you to do imports like

```less
@import 'styles/colors.less'; // assuming a styles directory under src/
@import '~nprogress/nprogress'; // importing a css file from the nprogress node module
```

> **Note:** You must prefix imports from `node_modules` with `~` as displayed above.

To configure `less-loader`, add a file `.less-loader.js` to the root of the project, that exports the options you want to use.

For example you could pass the `modifyVars` option to `less` with

```js
module.exports = {
  lessOptions: {
    modifyVars: {
      'primary-color': 'green',
    },
  },
};
```

> **Tip:** You can opt into using this feature with [CSS modules](adding-a-css-modules-stylesheet.md) too!

> **Note:** If you're using Flow, override the [module.file_ext](https://flow.org/en/docs/config/options/#toc-module-file-ext-string) setting in your `.flowconfig` so it'll recognize `.less` files. You will also need to include the `module.file_ext` default settings for `.js`, `.jsx`, `.mjs` and `.json` files.
>
> ```
> [options]
> module.file_ext=.js
> module.file_ext=.jsx
> module.file_ext=.mjs
> module.file_ext=.json
> module.file_ext=.less
> ```
