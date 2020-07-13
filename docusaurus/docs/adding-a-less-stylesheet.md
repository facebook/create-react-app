---
id: adding-a-less-stylesheet
title: Adding a Less Stylesheet
sidebar_label: Adding Less Stylesheets
---

> Note: this feature is available with `react-scripts@3.4.1` and higher.

Generally, we recommend that you don’t reuse the same CSS classes across different components. For example, instead of using a `.Button` CSS class in `<AcceptButton>` and `<RejectButton>` components, we recommend creating a `<Button>` component with its own `.Button` styles, that both `<AcceptButton>` and `<RejectButton>` can render (but [not inherit](https://facebook.github.io/react/docs/composition-vs-inheritance.html)).

Following this rule often makes CSS preprocessors less useful, as features like mixins and nesting are replaced by component composition. You can, however, integrate a CSS preprocessor if you find it valuable.

You can rename `src/App.css` to `src/App.less` and update `src/App.js` to import `src/App.less`.
This file and any other file will be automatically compiled if imported with the extension `.less`.

To share variables between Less files, you can use Less imports. For example, `src/App.less` and other component style files could include `@import "./shared.less";` with variable definitions.

This will allow you to do imports like

```less
@import './_colors.less';
```
