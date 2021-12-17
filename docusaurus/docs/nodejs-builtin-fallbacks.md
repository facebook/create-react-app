---
id: nodejs-builtin-fallbacks
title: NodeJS builtin fallbacks
---

NodeJS builtin fallbacks enable you to import NodeJS builtin modules meant for Node and fallback to browser specific modules in your web application.

Per default Create React App set fallbacks to empty modules in production build and development fallbacks in development mode.

In development mode you might get error messages in your browser console similar to:

```
(dev) Error: Module "path" not found, cannot access property "join", please read https://create-react-app.dev/docs/nodejs-builtin-fallbacks
```

_(It's possible to disable these warnings in development using the environment variable: `DISABLE_MISSING_NODEJS_BUILTIN_MODULE_FALLBACK_WARNING=true`)_

**IMPORTANT:** Before fixing this dependency, please make sure to only use Npm packages meant for the browser and not for Node / backend.

It takes abit of work but visit the project documentation, README.md and if on GitHub etc. look open and closed issues in the project e.g. search "browser" to see if maintainers close issues for browser support.

Implications of loading packages not build for the browser can vary from security, bundle size etc. - There might be better alternatives.

**Escape hatch**

To fix the issue you will need to add the browser fallback - the example above complains about missing `path` module.

```bash
npm install path-browserif
# or..
yarn add path-browserif
```

Create React App will recognize the fallback and use that instead of an empty module.
_(Find the fallback package in the table bellow)_

| NodeJS builtin module | Browser version            |
| :-------------------- | :------------------------- |
| assert                | assert                     |
| buffer                | buffer                     |
| console               | console-browserif          |
| constants             | constants-browserif        |
| crypto                | crypto-browserif           |
| domain                | domain-browse              |
| events                | events                     |
| http                  | stream-htt                 |
| https                 | https-browserif            |
| os                    | os-browserify/browse       |
| path                  | path-browserif             |
| punycode              | punycode                   |
| process               | process/browse             |
| querystring           | querystring-es             |
| stream                | stream-browserif           |
| stream_duplex         | readable-stream/duple      |
| stream_passthrough    | readable-stream/passthroug |
| stream_readable       | readable-stream/readabl    |
| stream_transform      | readable-stream/transfor   |
| stream_writable       | readable-stream/writabl    |
| string_decoder        | string_decoder             |
| sys                   | util                       |
| timers                | timers-browserif           |
| tty                   | tty-browserif              |
| url                   | url                        |
| util                  | util                       |
| vm                    | vm-browserif               |
| zlib                  | browserify-zlib            |
