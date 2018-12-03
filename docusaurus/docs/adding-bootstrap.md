---
id: adding-bootstrap
title: Adding Bootstrap
---

You don’t have to use [reactstrap](https://reactstrap.github.io/) together with React but it is a popular library for integrating Bootstrap with React apps. If you need it, you can integrate it with Create React App by following these steps:

Install reactstrap and Bootstrap from npm. reactstrap does not include Bootstrap CSS so this needs to be installed as well:

```sh
npm install --save reactstrap bootstrap@4
```

Alternatively you may use `yarn`:

```sh
yarn add bootstrap@4 reactstrap
```

Import Bootstrap CSS and optionally Bootstrap theme CSS in the beginning of your `src/index.js` file:

```js
import 'bootstrap/dist/css/bootstrap.css';
// Put any other imports below so that CSS from your
// components takes precedence over default styles.
```

Import required reactstrap components within `src/App.js` file or your custom component files:

```js
import { Button } from 'reactstrap';
```

Now you are ready to use the imported reactstrap components within your component hierarchy defined in the render method. Here is an example [`App.js`](https://gist.githubusercontent.com/zx6658/d9f128cd57ca69e583ea2b5fea074238/raw/a56701c142d0c622eb6c20a457fbc01d708cb485/App.js) redone using reactstrap.

## Using a Custom Theme

> Note: this feature is available with `react-scripts@2.0.0` and higher.

Sometimes you might need to tweak the visual styles of Bootstrap (or equivalent package).<br>
As of `react-scripts@2.0.0` you can import `.scss` files. This makes it possible to use a package's built-in Sass variables for global style preferences.

To customize Bootstrap, create a file called `src/custom.scss` (or similar) and import the Bootstrap source stylesheet. Add any overrides _before_ the imported file(s). You can reference [Bootstrap's documentation](http://getbootstrap.com/docs/4.1/getting-started/theming/#css-variables) for the names of the available variables.

```scss
// Override default variables before the import
$body-bg: #000;

// Import Bootstrap and its default variables
@import '~bootstrap/scss/bootstrap.scss';
```

> **Note:** You must prefix imports from `node_modules` with `~` as displayed above.

Finally, import the newly created `.scss` file instead of the default Bootstrap `.css` in the beginning of your `src/index.js` file, for example:

```javascript
import './custom.scss';
```
