## LoggedInCard

It doesn't make any sense to render the LoggedInCard without passing the user to it. Here is how it is used in ExamplePage.js

```js
{
  user.signedIn ? <LoggedInCard user={user} portrait={portrait} /> : <NotLoggedInCard />
}
```
