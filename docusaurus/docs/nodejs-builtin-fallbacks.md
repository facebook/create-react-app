---
id: nodejs-builtin-fallbacks
title: NodeJS builtin fallbacks
---

NodeJS builtin fallbacks enable you to import NodeJS builtin modules meant for Node and fallback to browser specific modules.

If your application dependens on a package using NodeJS builtin modules it will require a fallback to run in the browser.

Example of error message:

```
> yarn build
Creating an optimized production build...
Failed to compile.

Module not found: Error: Can't resolve 'url' in '...'
BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.

If you want to include a polyfill, you need to:
	- add a fallback 'resolve.fallback: { "url": require.resolve("url/") }'
	- install 'url'
If you don't want to include a polyfill, you can use an empty module like this:
	resolve.fallback: { "url": false }
>
```

To resolve this error you would need to install the package `url` in your project.

```bash
npm install url
# or..
yarn add url
```

_(We don't support to not include the polyfill if needed)_
