---
id: adding-typescript
title: Adding TypeScript
---

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.

Recent versions of [TypeScript](https://www.typescriptlang.org/) work with Create React App projects out of the box thanks to Babel 7. Note that Babel 7 TypeScript does not allow some features of TypeScript such as constant enum and namespaces.

To add TypeScript to a Create React App project, follow these steps:

1. Run `npm install --save typescript @types/react @types/react-dom @types/jest` (or `yarn add typescript @types/react @types/react-dom @types/jest`).
2. Rename the `.js` files you want to convert: use `.tsx` if they use JSX or `.ts` if not (e.g. `git mv src/index.js src/index.tsx`).
3. Create a [`tsconfig.json` file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) at the root directory with `{}` in it. Alternatively, rename `index.js` to `index.tsx`.
4. Restart your development server (if applicable). This will set sensible defaults and the required values in your [`tsconfig.json` file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).

Type errors will show up in the same console as the build one.

We recommend using [VSCode](https://code.visualstudio.com/) for a better integrated experience.

To learn more about TypeScript, check out [its documentation](https://www.typescriptlang.org/).
