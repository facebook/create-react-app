Below you will find some information on how to perform common tasks.  
You can find the most recent version of this guide [here](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md).

## Table of Contents

- [Sending Feedback](#sending-feedback)
- [Folder Structure](#folder-structure)
- [Available Scripts](#available-scripts)
	- [npm start](#npm-start)
	- [npm run build](#npm-run-build)
	- [npm run eject](#npm-run-eject)
- [How To...](#how-to)
	- [Install a Dependency](#install-a-dependency)
	- [Import a Component](#import-a-component)
	- [Add a Stylesheet](#add-a-stylesheet)
	- [Post-Process CSS](#post-process-css)
	- [Add Images and Fonts](#add-images-and-fonts)
	- [Install React Bootstrap](#install-react-bootstrap)
	- [Display Lint Output in the Editor](#display-lint-output-in-the-editor)
	- [Add Flow](#add-flow)
	- [Deploy](#deploy)
	- [Something Missing?](#something-missing)

## Sending Feedback

We are always open to [your feedback](https://github.com/facebookincubator/create-react-app/issues).

## Folder Structure

After creation, your project should look like this:

```
my-app/
  README.md
  index.html
  favicon.ico
  node_modules/
  package.json
  src/
    App.css
    App.js
    index.css
    index.js
    logo.svg
```

For the project to build, **these files must exist with exact filenames**:

* `index.html` is the page template;
* `favicon.ico` is the icon you see in the browser tab;
* `src/index.js` is the JavaScript entry point.

You can delete or rename the other files.

You may create subdirectories inside `src`. For faster rebuilds, only files inside `src` are processed by Webpack.  
You need to **put any JS and CSS files inside `src`**, or Webpack won’t see them.

You can, however, create more top-level directories.  
They will not be included in the production build so you can use them for things like documentation.

>**Known Issue:**
>
>You may encounter an issue where changing a file inside `src` doesn’t trigger a recompilation. Most likely this happens because the path in your filesystem differs in its casing from the path you imported. For example, if a file is called `App.js` but you are importing `app.js`, the watcher might not recognize changes to it. We are [considering](https://github.com/facebookincubator/create-react-app/issues/240) enforcing some checks to prevent this. If this doesn’t help, check out the page on [troubleshooting watching](https://webpack.github.io/docs/troubleshooting.html#watching).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## How To...

### Install a Dependency

The generated project includes React and ReactDOM as dependencies. It also includes a set of scripts used by Create React App as a development dependency. You may install other dependencies (for example, React Router) with `npm`:

```
npm install --save <library-name>
```

### Import a Component

This project setup supports ES6 modules thanks to Babel.  
While you can still use `require()` and `module.exports`, we encourage you to use [`import` and `export`](http://exploringjs.com/es6/ch_modules.html) instead.

For example:

#### `Button.js`

```js
import React, { Component } from 'react';

class Button extends Component {
  render() {
    // ...
  }
}

export default Button; // Don’t forget to use export default!
```

#### `DangerButton.js`

```js
import React, { Component } from 'react';
import Button from './Button'; // Import a component from another file

class DangerButton extends Component {
  render() {
    return <Button color="red" />;
  }
}

export default DangerButton;
```

Be aware of the [difference between default and named exports](http://stackoverflow.com/questions/36795819/react-native-es-6-when-should-i-use-curly-braces-for-import/36796281#36796281). It is a common source of mistakes.

We suggest that you stick to using default imports and exports when a module only exports a single thing (for example, a component). That’s what you get when you use `export default Button` and `import Button from './Button'`.

Named exports are useful for utility modules that export several functions. A module may have at most one default export and as many named exports as you like.

Learn more about ES6 modules:

* [When to use the curly braces?](http://stackoverflow.com/questions/36795819/react-native-es-6-when-should-i-use-curly-braces-for-import/36796281#36796281)
* [Exploring ES6: Modules](http://exploringjs.com/es6/ch_modules.html)
* [Understanding ES6: Modules](https://leanpub.com/understandinges6/read#leanpub-auto-encapsulating-code-with-modules)

### Add a Stylesheet

This project setup uses [Webpack](https://webpack.github.io/) for handling all assets. Webpack offers a custom way of “extending” the concept of `import` beyond JavaScript. To express that a JavaScript file depends on a CSS file, you need to **import the CSS from the JavaScript file**:

#### `Button.css`

```css
.Button {
  padding: 20px;
}
```

#### `Button.js`

```js
import React, { Component } from 'react';
import './Button.css'; // Tell Webpack that Button.js uses these styles

class Button extends Component {
  render() {
    // You can use them as regular CSS styles
    return <div className="Button" />;
  }
}
```

**This is not required for React** but many people find this feature convenient. You can read about the benefits of this approach [here](https://medium.com/seek-ui-engineering/block-element-modifying-your-javascript-components-d7f99fcab52b). However you should be aware that this makes your code less portable to other build tools and environments than Webpack.

In development, expressing dependencies this way allows your styles to be reloaded on the fly as you edit them. In production, all CSS files will be concatenated into a single minified `.css` file in the build output.

If you are concerned about using Webpack-specific semantics, you can put all your CSS right into `src/index.css`. It would still be imported from `src/index.js`, but you could always remove that import if you later migrate to a different build tool.

### Post-Process CSS

This project setup minifies your CSS and adds vendor prefixes to it automatically through [Autoprefixer](https://github.com/postcss/autoprefixer) so you don’t need to worry about it.

For example, this:

```css
.App {
  display: flex;
  flex-direction: row;
  align-items: center;
}
```

becomes this:

```css
.App {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
      -ms-flex-direction: row;
          flex-direction: row;
  -webkit-box-align: center;
      -ms-flex-align: center;
          align-items: center;
}
```

There is currently no support for preprocessors such as Less, or for sharing variables across CSS files.

### Add Images and Fonts

With Webpack, using static assets like images and fonts works similarly to CSS.

You can **`import` an image right in a JavaScript module**. This tells Webpack to include that image in the bundle. Unlike CSS imports, importing an image or a font gives you a string value. This value is the final image path you can reference in your code.

Here is an example:

```js
import React from 'react';
import logo from './logo.png'; // Tell Webpack this JS file uses this image

console.log(logo); // /logo.84287d09.png

function Header() {
  // Import result is the URL of your image
  return <img src={logo} alt="Logo" />;
}

export default function Header;
```

This works in CSS too:

```css
.Logo {
  background-image: url(./logo.png);
}
```

Webpack finds all relative module references in CSS (they start with `./`) and replaces them with the final paths from the compiled bundle. If you make a typo or accidentally delete an important file, you will see a compilation error, just like when you import a non-existent JavaScript module. The final filenames in the compiled bundle are generated by Webpack from content hashes. If the file content changes in the future, Webpack will give it a different name in production so you don’t need to worry about long-term caching of assets.

Please be advised that this is also a custom feature of Webpack.

**It is not required for React** but many people enjoy it (and React Native uses a similar mechanism for images). However it may not be portable to some other environments, such as Node.js and Browserify. If you prefer to reference static assets in a more traditional way outside the module system, please let us know [in this issue](https://github.com/facebookincubator/create-react-app/issues/28), and we will consider support for this.

### Install React Bootstrap

You don’t have to use React Bootstrap together with React but it is a popular library for integrating Bootstrap with React apps. If you need it, you can integrate it with Create React App by following these steps:

**Step 1.** Install React Bootstrap and Bootstrap from NPM. React Bootstrap does not include Bootstrap CSS so this needs to be installed as well.

```
npm install react-bootstrap --save
npm install bootstrap@3 --save
```

**Step 2.** Import Bootstrap CSS and optionally Bootstrap theme CSS in the ```index.js``` file.

```
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
```

**Step 3.** Import required React Bootstrap components within ```App.js``` file or your custom component files.

```
import React, { Component } from 'react';
import { Navbar, Jumbotron, Button } from 'react-bootstrap';
``` 

Now you are ready to use the imported React Bootstrap components within your component hierarchy defined in the render method. Here is an example [App.js](https://github.com/manavsehgal/react-eshop/blob/master/src/App.js) redone using React Bootstrap.

### Display Lint Output in the Editor

>Note: this feature is available with `react-scripts@0.2.0` and higher.

Some editors, including Sublime Text, Atom, and Visual Studio Code, provide plugins for ESLint.

They are not required for linting. You should see the linter output right in your terminal as well as the browser console. However, if you prefer the lint results to appear right in your editor, there are some extra steps you can do.

You would need to install an ESLint plugin for your editor first.  
Then make sure `package.json` of your project ends with this block:

```js
{
  // ...
  "eslintConfig": {
    "extends": "./node_modules/react-scripts/config/eslint.js"
  }
}
```

Projects generated with `react-scripts@0.2.0` and higher should already have it.  
If you don’t need ESLint integration with your editor, you can safely delete those three lines from your `package.json`.

Finally, you will need to install some packages *globally*:

```sh
npm install -g eslint babel-eslint eslint-plugin-react eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-flowtype
```

We recognize that this is suboptimal, but it is currently required due to the way we hide the ESLint dependency. The ESLint team is already [working on a solution to this](https://github.com/eslint/eslint/issues/3458) so this may become unnecessary in a couple of months.

### Add Flow

Flow typing is currently [not supported out of the box](https://github.com/facebookincubator/create-react-app/issues/72) with the default `.flowconfig` generated by Flow. If you run it, you might get errors like this:

```
node_modules/fbjs/lib/Deferred.js.flow:60
 60:     Promise.prototype.done.apply(this._promise, arguments);
                           ^^^^ property `done`. Property not found in
495: declare class Promise<+R> {
     ^ Promise. See lib: /private/tmp/flow/flowlib_34952d31/core.js:495

node_modules/fbjs/lib/shallowEqual.js.flow:29
 29:     return x !== 0 || 1 / (x: $FlowIssue) === 1 / (y: $FlowIssue);
                                   ^^^^^^^^^^ identifier `$FlowIssue`. Could not resolve name

src/App.js:3
  3: import logo from './logo.svg';
                      ^^^^^^^^^^^^ ./logo.svg. Required module not found

src/App.js:4
  4: import './App.css';
            ^^^^^^^^^^^ ./App.css. Required module not found

src/index.js:5
  5: import './index.css';
            ^^^^^^^^^^^^^ ./index.css. Required module not found
```

To fix this, change your `.flowconfig` to look like this:

```
[libs]
./node_modules/fbjs/flow/lib

[options]
esproposal.class_static_fields=enable
esproposal.class_instance_fields=enable

module.name_mapper='^\(.*\)\.css$' -> 'react-scripts/config/flow/css'
module.name_mapper='^\(.*\)\.\(jpg\|png\|gif\|eot\|svg\|ttf\|woff\|woff2\|mp4\|webm\)$' -> 'react-scripts/config/flow/file'

suppress_type=$FlowIssue
suppress_type=$FlowFixMe
```

Re-run flow, and you shouldn’t get any extra issues.

If you later `eject`, you’ll need to replace `react-scripts` references with the `<PROJECT_ROOT>` placeholder, for example:

```
module.name_mapper='^\(.*\)\.css$' -> '<PROJECT_ROOT>/config/flow/css'
module.name_mapper='^\(.*\)\.\(jpg\|png\|gif\|eot\|svg\|ttf\|woff\|woff2\|mp4\|webm\)$' -> '<PROJECT_ROOT>/config/flow/file'
```

We will consider integrating more tightly with Flow in the future so that you don’t have to do this.

### Deploy

#### GitHub Pages

>Note: this feature is available with `react-scripts@0.2.0` and higher.

First, open your `package.json` and add a `homepage` field.
It could look like this:

```js
{
  "name": "my-app",
  "homepage": "http://myusername.github.io/my-app",
  // ...
}
```

Now, whenever you run `npm run build`, you will see a cheat sheet with a sequence of commands to deploy to GitHub pages:

```sh
git checkout -B gh-pages
git add -f build
git commit -am "Rebuild website"
git push origin :gh-pages
git subtree push --prefix build origin gh-pages
git checkout -
```

You may copy and paste them, or put them into a custom shell script. You may also customize them for another hosting provider.

Note that GitHub Pages doesn't support routers that use the HTML5 `pushState` history API under the hood (for example, React Router using `browserHistory`). This is becasue when there is a fresh page load for a url like `http://user.github.io/todomvc/todos/42`, where `/todos/42` is a frontend route, the GitHub Pages server returns 404 because it knows nothing of `/todos/42`. If you want to add a router to a project hosted on GitHub Pages, here are a couple of solutions:
* You could switch from using HTML5 history API to routing with hashes. If you use React Router, you can switch to `hashHistory` for this effect, but the URL will be longer and more verbose (for example, `http://user.github.io/todomvc/#/todos/42?_k=yknaj`). [Read more](https://github.com/reactjs/react-router/blob/master/docs/guides/Histories.md#histories) about different history implementations in React Router.
* Alternatively, you can use a trick to teach GitHub Pages to handle 404 by redirecting to your `index.html` page with a special redirect parameter. You would need to add a `404.html` file with the redirection code to the `build` folder before deploying your project, and you’ll need to add code handling the redirect parameter to `index.html`. You can find a detailed explanation of this technique [in this guide](https://github.com/rafrex/spa-github-pages).

#### Heroku

Use the [Heroku Buildpack for create-react-app](https://github.com/mars/create-react-app-buildpack).

### Something Missing?

If you have ideas for more “How To” recipes that should be on this page, [let us know](https://github.com/facebookincubator/create-react-app/issues) or [contribute some!](https://github.com/facebookincubator/create-react-app/edit/master/template/README.md)
