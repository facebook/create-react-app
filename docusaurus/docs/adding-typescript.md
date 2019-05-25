---
id: adding-typescript
title: Adding TypeScript
---

> Note: this feature is available with `react-scripts@2.1.0` and higher.

[TypeScript](https://www.typescriptlang.org/) is a typed superset of JavaScript that compiles to plain JavaScript.

To start a new Create React App project with [TypeScript](https://www.typescriptlang.org/), you can run:

```sh
npx create-react-app my-app --typescript

# or

yarn create react-app my-app --typescript
```

> If you've previously installed `create-react-app` globally via `npm install -g create-react-app`, we recommend you uninstall the package using `npm uninstall -g create-react-app` to ensure that `npx` always uses the latest version.

To add [TypeScript](https://www.typescriptlang.org/) to a Create React App project, first install it:

```sh
npm install --save typescript @types/node @types/react @types/react-dom @types/jest

# or

yarn add typescript @types/node @types/react @types/react-dom @types/jest
```

Next, rename any file to be a TypeScript file (e.g. `src/index.js` to `src/index.tsx`) and **restart your development server**!

Type errors will show up in the same console as the build one.

To learn more about TypeScript, check out [its documentation](https://www.typescriptlang.org/).

> **Note:** If your project is not created with TypeScript enabled, npx may be using a cached version of `create-react-app`.
> Remove previously installed versions with `npm uninstall -g create-react-app` (see [#6119](https://github.com/facebook/create-react-app/issues/6119#issuecomment-451614035)).

> **Note:** You are not required to make a [`tsconfig.json` file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html), one will be made for you.
> You are allowed to edit the generated TypeScript configuration.

> **Note:** If you are currently using [create-react-app-typescript](https://github.com/wmonk/create-react-app-typescript/), see [this blog post](https://vincenttunru.com/migrate-create-react-app-typescript-to-create-react-app/) for instructions on how to migrate to Create React App.

> **Note:** We recommend using [VSCode](https://code.visualstudio.com/) for a better integrated experience.

> **Note:** Constant enums and namespaces are not supported.
