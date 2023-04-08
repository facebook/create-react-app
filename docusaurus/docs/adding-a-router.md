---
id: adding-a-router
title: Adding a Router
---

Create React App doesn't prescribe a specific routing solution, but [React Router](https://reactrouter.com/) is the most popular one.

To add it, run:

```sh
npm install react-router-dom
```

Alternatively you may use `yarn`:

```sh
yarn add react-router-dom
```

To try it, delete all the code in `src/App.js` and replace it with any of the examples on its website. The [Basic Example](https://reactrouter.com/docs/examples/basic) is a good place to get started. For more info on adding routes, check out [the React Router docs on adding routes](https://reactrouter.com/docs/getting-started/tutorial#add-some-routes).

Note that [you may need to configure your production server to support client-side routing](deployment.md#serving-apps-with-client-side-routing) before deploying your app.
