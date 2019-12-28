---
id: adding-multiple-entry-points
title: Adding multiple entry points
---

Create React App comes with an embedded `index.html` and `index.js` which is shown when you're running the `app` at `http://localhost:3000`. In case you decided to add new `apps` (pages/entry point), please, follow the steps:

## Creating files

Please, create your `.html` and `.js` (Or TypeScript file). The embedded files come inside `public` and `src` folder.

## Add the new app in package.json

After creating the `app` files, you must specify it into the `appPages` inside the `package.json`. It should shape the following structure:

```json
{
  "name": "login",
  "title": "login",
  "appHtml": "public/login.html",
  "appIndexJs": "src/login"
}
```

## Accessing the new app

Run `npm start` or `yarn start` and change the URL by referencing the new page, like `http://localhost:3000/login.html`
