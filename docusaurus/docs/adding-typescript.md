---
id: adding-typescript
title: Adding TypeScript
---

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.

Recent versions of [TypeScript](https://www.typescriptlang.org/) work with Create React App projects out of the box thanks to Babel 7. Beware that Babel 7 TypeScript does not allow some features of TypeScript such as constant enum and namespaces.

To add TypeScript to a Create React App project, follow these steps:

1. Run `npm install --save typescript fork-ts-checker-webpack-plugin @types/react @types/react-dom @types/jest` (or `yarn add typescript fork-ts-checker-webpack-plugin @types/react @types/react-dom @types/jest`).
2. Rename the `.js` files you want to convert. Use `.tsx` if they use JSX or `.ts` if not (e.g. `git mv src/index.js src/index.tsx`).

3. Create a [`tsconfig.json` file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) at the root directory with the following content:

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": ["esnext", "dom", "dom.iterable"],
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true
  },
  "include": ["src"]
}
```

4. Copy [loaders.d.ts](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/src/loaders.d.ts) from the template to your `src` directory.

Type errors will show up in the same console as the build one.

> Note: If you prefer to run type checking separately from the build process, you can run `npm uninstall fork-ts-checker-webpack-plugin` (or `yarn remove fork-ts-checker-webpack-plugin`) to remove the `fork-ts-checker-webpack-plugin` dependency and then `npx tsc -w` on a new terminal tab.

We recommend using [VSCode](https://code.visualstudio.com/) for a better integrated experience.

To learn more about TypeScript, check out [its documentation](https://www.typescriptlang.org/).
