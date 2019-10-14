---
id: using-web-workers
titile: Using Web Workers
---

[Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
can be used by including files with the `.worker.js` in your application. Files
with this extension make use of [`worker-loader`](https://github.com/webpack-contrib/worker-loader)
to bundle worker files which can be used by your main application.

A sample WebWorker may look like:

```js
// hello.worker.js

let helloInterval;

const sayHello = () => {
  self.postMessage({ message: 'Hello' });
};

self.addEventListener('message', event => {
  if (event.data.run === true) {
    self.postMessage({ status: 'Worker started' });
    helloInterval = setInterval(sayHello, 1000);
  }

  if (event.data.run === false) {
    self.postMessage({ status: 'Worker stopped' });
    clearInterval(helloInterval);
  }
});
```

This can subsequently be imported and used in your application as:

```js
// index.js

import HelloWorker from './hello.worker.js';

const helloWorker = new HelloWorker();
let messageCount = 0;

helloWorker.postMessage({ run: true });

helloWorker.onmessage = event => {
  if (event.data.status) {
    console.log('STATUS', event.data.status);
  }

  if (event.data.message) {
    messageCount += 1;
    console.log('MESSAGE', event.data.message);

    if (messageCount >= 5) {
      helloWorker.postMessage({ run: false });
    }
  }
};
```

## Importing modules into your workers

Worker files can import modules just the same as the rest of your
application. These will be compiled following the same rules and features as
regular `.js` or `.ts` files.

## Usage with TypeScript

Workers can be written in TypeScript, however you are required to declare the
file as a worker in order for the compiler to understand that it is a worker.
This can be done by including:

```ts
/// <reference lib="webworker" />
```

at the beginning of all of your `.worker.ts` files.

Because the interface imported is different from what is in your worker files,
you'll also need to tell TypeScript what you're expecting this interface to look
like. To achieve this, you will need to have a module declaration in each of
your worker files like so:

```ts
// my.worker.ts
// <worker code>

// Necessary to tell typescript that this worker file is a module even though
// it may not have any explicit imports or exports
export {};

// Override the module declaration to tell Typescript that when imported, this
// is what the imported types will look like.
declare module './my.worker' {
  export default class TestWorker extends Worker {
    constructor();
  }
}
```
