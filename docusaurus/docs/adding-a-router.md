---
id: adding-a-router
title: Adding a Router
---

Create React App doesn't prescribe a specific routing solution, but [React Router](https://reacttraining.com/react-router/web/) is the most popular one.

To add it, run:

```sh
npm install --save react-router-dom
```

Alternatively you may use `yarn`:

```sh
yarn add react-router-dom
```

To try it, delete all the code in `src/App.js` and replace it with any of the examples on its website. The [Basic Example](https://reactrouter.com/docs/en/v6/examples/basic) or the [Tutorial](https://reactrouter.com/docs/en/v6/getting-started/tutorial) are good places to get started. 

Note that [you may need to configure your production server to support client-side routing](deployment.md#serving-apps-with-client-side-routing) before deploying your app.
