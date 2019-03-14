The following usage is how UserInfo is used in src/components/App.js

```js static
<Router>
  <Home path="/" />
  <RequiresAuth path="/user" component={UserInfo} />
  <NotFound default />
</Router>
```
