# Migrating from 4.0.0 to 5.0.0

## Prerequisites

A prebuilt version of `@trunkclub/web`.

## Upgrade node and npm

```bash
nvm install lts/boron
nvm use lts/boron
node -v > .nvmrc
```

## Install 5.0.0

```bash
npm install --save-dev @trunkclub/build@latest
```

## Remove unused files

There are likely to be files in the project that are no longer needed. Here
are some examples.

```
.babelrc
.eslintrc
.eslintrc.json
.tcwebrc
jasmine.json
karma.conf
script/jasmine-wrapper.js
webpack.config.js
```

## Move your entry point

It is possible that your entry point file is not where `@trunkclub/build@^5.0.0`
expects it. Your `index.es6` or `index.js` file should be in
`./src/index.(es6|js)`. If it isn't, go ahead and move it there. Also, make
sure any relative imports are modified accordingly.

## Move and modify your `index.html`

Your `index.html` template is expected in `./public/index.html`. Move it there
and remove any old template references (like `{{OUTPUT_TARGET}}`), `build`
does this for you now.

## Make changes to `.gitignore`

Add two rules

```bash
printf "artifacts/\nbuild/\n" >> .gitignore
```

Remove references to `public`, `dist`, and the like.

## Create `[environment].env` files

```bash
touch {development,staging,production}.env
```

### PORT

Add `PORT={your old port value here}` to your `development.env`

### Accessing envars

#### **TC_** prefix

Only `PORT`, `NODE_ENV`, `PUBLIC_URL`, and environment variables starting with `TC_` are
available within the bundle.

#### Usage in JavaScript files

In JavaScript files, environment variables are available on `process.env`

```js
if (process.env.NODE_ENV === 'development') {
  // Do something only in development...
}
```

#### Usage in `./public/index.html`

If you need to access an environment variable within your html template, you
can do so by wrapping the variable name in `%`

```html
<head>
  <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
</head>
```

## Migrate script tags

Copy script tag content into `public/index.html`. Change interpolated variables
into %TC_ENVAR% references.

## Change npm and ./script/ scripts

Most existing scripts should work as they did in `4.0.0` except testing which is now included in build.

Change your `npm test` script to `tcweb-build test --env=jsdom` (you can leave out the `--env=jsdom` if you don't need DOM like access in your tests).

You no longer need to build all of your files using babel before running tests. Imports of files in tests can use root relative imports just like in your source code files.

## `circle.yml` and `./script/deploy`

Make sure the node version in your circle.yml matches that in your `./.nvmrc`

Change references to `./public` in `./script/deploy` to `./build`
