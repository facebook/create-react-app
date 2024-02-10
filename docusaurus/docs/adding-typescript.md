---
id: adding-typescript
title: Adding TypeScript
---

> Note: this feature is available with `react-scripts@2.1.0` and higher.

[TypeScript](https://www.typescriptlang.org/) is a typed superset of JavaScript that compiles to plain JavaScript.

## Installation

To start a new Create React App project with [TypeScript](https://www.typescriptlang.org/), you can run:

```sh
npx create-react-app my-app --template typescript
```

or

```sh
yarn create react-app my-app --template typescript
```

> If you've previously installed `create-react-app` globally via `npm install -g create-react-app`, we recommend you uninstall the package using `npm uninstall -g create-react-app` or `yarn global remove create-react-app` to ensure that `npx` always uses the latest version.
>
> Global installs of `create-react-app` are no longer supported.

To add [TypeScript](https://www.typescriptlang.org/) to an existing Create React App project, first install it:

```sh
npm install --save typescript @types/node @types/react @types/react-dom @types/jest
```

or

```sh
yarn add typescript @types/node @types/react @types/react-dom @types/jest
```

Next, rename any file to be a TypeScript file (e.g. `src/index.js` to `src/index.tsx`) and create tsconfig.json if it's not in the root of your project [`tsconfig.json` file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

Finally **restart your development server**!

Type errors will show up in the same console as the build one. You'll have to fix these type errors before you continue development or build your project. For advanced configuration, [see here](advanced-configuration.md).

## Getting Started with TypeScript and React

You are not required to make a [`tsconfig.json` file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html), one will be made for you. You are allowed to edit the generated TypeScript configuration.

- [TypeScript Handbook](https://www.typescriptlang.org/)
- [TypeScript Example on React](https://www.typescriptlang.org/play/index.html?jsx=2&esModuleInterop=true&e=196#example/typescript-with-react)
- [React + TypeScript Cheatsheets](https://github.com/typescript-cheatsheets/react-typescript-cheatsheet#reacttypescript-cheatsheets) has a good overview on how to use React with TypeScript

## Troubleshooting

If your project is not created with TypeScript enabled, npx may be using a cached version of `create-react-app`. Remove previously installed versions with `npm uninstall -g create-react-app` or `yarn global remove create-react-app` (see [#6119](https://github.com/facebook/create-react-app/issues/6119#issuecomment-451614035)).

If you are currently using [create-react-app-typescript](https://github.com/wmonk/create-react-app-typescript/), see [this blog post](https://vincenttunru.com/migrate-create-react-app-typescript-to-create-react-app/) for instructions on how to migrate to Create React App.

Constant enums and namespaces are not supported, you can learn about the constraints of [using Babel with TypeScript here](https://babeljs.io/docs/en/babel-plugin-transform-typescript#caveats).
