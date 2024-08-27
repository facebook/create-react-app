---
id: adding-flow
title: Adding Flow
---

Flow is a static type checker that helps you write code with fewer bugs. Check out this [introduction to using static types in JavaScript](https://medium.com/@preethikasireddy/why-use-static-types-in-javascript-part-1-8382da1e0adb) if you are new to this concept.

Recent versions of [Flow](https://flow.org/) work with Create React App projects out of the box.

To add Flow to a Create React App project, follow these steps:

1. Run `npm install --save flow-bin` (or `yarn add flow-bin`).
2. Add `"flow": "flow"` to the `scripts` section of your `package.json`.
3. Run `npm run flow init` (or `yarn flow init`) to create a [`.flowconfig` file](https://flow.org/en/docs/config/) in the root directory.
4. Add `// @flow` to any files you want to type check (for example, to `src/App.js`).

Now you can run `npm run flow` (or `yarn flow`) to check the files for type errors.  
You can optionally enable an extension for your IDE, such as [Flow Language Support](https://github.com/flowtype/flow-for-vscode) for Visual Studio Code, or leverage the Language Server Protocol standard (e.g. [vim LSP](https://github.com/prabirshrestha/vim-lsp/wiki/Servers-Flow)) to get hints while you type.

## Absolute Imports

If you'd like to use [absolute imports](/docs/importing-a-component#absolute-imports) with Flow,
make sure to add the following line to your `.flowconfig` to make Flow aware of it:

```diff
  [options]
+ module.name_mapper='^\([^\.].*\)$' -> '<PROJECT_ROOT>/src/\1'
```

## Using the new JSX transform

To enable Flow to use the new JSX transform, you need to enable it in your `.flowconfig` file:

```diff
  [options]
+ react.runtime=automatic
```

## Working with 3rd party type definitions

npm packages can come with built-in Flow type definitions, unfortunately, sometimes those type definitions are not fully-compatible with
the Flow version your project uses, or contain some errors.

Normally, Flow would throw errors, as if you had control over these 3rd party type definitions, but unfortunately you can't directly fix them.

Flow supports a way to define some type definitions as "declarations", this will tell Flow to **use** the type definitions, but to ignore any
errors that happen inside them.

You can configure your `.flowconfig` with the following lines:

```diff
+ [declarations]
+ <PROJECT_ROOT>/node_modules
```

Note, `declarations` and `ignore` are not the same thing, the latter will completely ignore the node modules type definitions, while the former
will use them, but suppress the errors targeting the type definitions.

To learn more about Flow, check out [its documentation](https://flow.org/).
