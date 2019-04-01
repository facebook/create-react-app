---
id: adding-a-sass-stylesheet
title: Adding a Sass Stylesheet
sidebar_label: Adding Sass Stylesheets
---

> Note: this feature is available with `react-scripts@2.0.0` and higher.

Generally, we recommend that you don’t reuse the same CSS classes across different components. For example, instead of using a `.Button` CSS class in `<AcceptButton>` and `<RejectButton>` components, we recommend creating a `<Button>` component with its own `.Button` styles, that both `<AcceptButton>` and `<RejectButton>` can render (but [not inherit](https://facebook.github.io/react/docs/composition-vs-inheritance.html)).

Following this rule often makes CSS preprocessors less useful, as features like mixins and nesting are replaced by component composition. You can, however, integrate a CSS preprocessor if you find it valuable.

To use Sass, first install `node-sass`:

```sh
$ npm install node-sass --save
$ # or
$ yarn add node-sass
```

Now you can rename `src/App.css` to `src/App.scss` and update `src/App.js` to import `src/App.scss`.
This file and any other file will be automatically compiled if imported with the extension `.scss` or `.sass`.

To share variables between Sass files, you can use Sass imports. For example, `src/App.scss` and other component style files could include `@import "./shared.scss";` with variable definitions.

This will allow you to do imports like

```scss
@import 'styles/_colors.scss'; // assuming a styles directory under src/
@import '~nprogress/nprogress'; // importing a css file from the nprogress node module
```

> **Note:** You must prefix imports from `node_modules` with `~` as displayed above.

`node-sass` also supports the `SASS_PATH` variable.

To use imports relative to a path you specify, and from `node_modules` without adding the `~` prefix, you can add a [`.env` file](https://github.com/facebook/create-react-app/blob/master/docusaurus/docs/adding-custom-environment-variables.md#adding-development-environment-variables-in-env) at the project root with the variable `SASS_PATH=node_modules:src`. To specify more directories you can add them to `SASS_PATH` separated by a `:` like `path1:path2:path3`.

If you set `SASS_PATH=node_modules:src`, this will allow you to do imports like
```scss
@import 'styles/colors'; // assuming a styles directory under src/, where _colors.scss partial file exists.
@import 'nprogress/nprogress'; // importing a css file from the nprogress node module
```

> **Tip:** You can opt into using this feature with [CSS modules](adding-a-css-modules-stylesheet.md) too!

> **Note:** If you're using Flow, override the [module.file_ext](https://flow.org/en/docs/config/options/#toc-module-file-ext-string) setting in your `.flowconfig` so it'll recognize `.sass` or `.scss` files. You will also need to include the `module.file_ext` default settings for `.js`, `.jsx`, `.mjs` and `.json` files.
>
> ```
> [options]
> module.file_ext=.js
> module.file_ext=.jsx
> module.file_ext=.mjs
> module.file_ext=.json
> module.file_ext=.sass
> module.file_ext=.scss
> ```
