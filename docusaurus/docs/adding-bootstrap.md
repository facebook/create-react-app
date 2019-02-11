---
id: adding-bootstrap
title: Adding Bootstrap
---

While you don’t have to use any specific library to integrate Bootstrap with React apps, it's often easier than trying to wrap the Bootstrap jQuery plugins. [React Bootstrap](https://react-bootstrap.netlify.com/) is the most popular option, that strives for complete parity with bootstrap. [reactstrap](https://reactstrap.github.io/) is also a good choice for projects looking for smaller builds at the expense of some features.

Each project's respective documentation site has detailed instructions for installing and using them. Both depend on the Bootstrap css file so install that as well:

```sh
npm install --save bootstrap
```

Alternatively you may use `yarn`:

```sh
yarn add bootstrap
```

Import Bootstrap CSS and optionally Bootstrap theme CSS in the beginning of your `src/index.js` file:

```js
import 'bootstrap/dist/css/bootstrap.css';
// Put any other imports below so that CSS from your
// components takes precedence over default styles.
```

## Using a Custom Theme

> Note: this feature is available with `react-scripts@2.0.0` and higher.

Sometimes you might need to tweak the visual styles of Bootstrap (or equivalent package).<br>
As of `react-scripts@2.0.0` you can import `.scss` files. This makes it possible to use a package's built-in Sass variables for global style preferences.

To customize Bootstrap, create a file called `src/custom.scss` (or similar) and import the Bootstrap source stylesheet. Add any overrides _before_ the imported file(s). You can reference [Bootstrap's documentation](https://getbootstrap.com/docs/4.1/getting-started/theming/#css-variables) for the names of the available variables.

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
