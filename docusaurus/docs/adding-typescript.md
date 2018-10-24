---
id: adding-typescript
title: Adding TypeScript
---

[TypeScript](https://www.typescriptlang.org/) is a typed superset of JavaScript that compiles to plain JavaScript.

To add [TypeScript](https://www.typescriptlang.org/) to a Create React App project, first install it:

```bash
$ npm install --save typescript @types/react @types/react-dom @types/jest
$ # or
$ yarn add typescript @types/react @types/react-dom @types/jest
```

Next, rename any file to be a TypeScript file (e.g. `src/index.js` to `src/index.tsx`) and **restart your development server**!

Type errors will show up in the same console as the build one.

To learn more about TypeScript, check out [its documentation](https://www.typescriptlang.org/).

> Note: We recommend using [VSCode](https://code.visualstudio.com/) for a better integrated experience.

> Note: Constant enum and namespaces are not supported.
