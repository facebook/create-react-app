---
id: can-i-use-decorators
title: Can I Use Decorators?
---

Some popular libraries use [decorators](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841) in their documentation.

Create React App intentionally doesn’t support decorator syntax at the moment because:

- It is an experimental proposal and is subject to change (in fact, it has already changed once, and will change again).
- Most libraries currently support only the old version of the proposal — which will never be a standard.

However in many cases you can rewrite decorator-based code without decorators just as fine.

Please refer to these two threads for reference:

- [#214](https://github.com/facebook/create-react-app/issues/214)
- [#411](https://github.com/facebook/create-react-app/issues/411)

Create React App will add decorator support when the specification advances to a stable stage.
