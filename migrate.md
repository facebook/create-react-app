# Migrating from 4.0.0 to 5.0.0

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

Your `index.html` template is expected in `./public/index.hmlt`. Move it there
and remove any old template referrences (like `{{OUTPUT_TARGET}}`), `build` 
does this for you now.

## Add some patterns to `.gitignore`

## Create `[environment].env` files

```bash
touch {development,staging,production}.env
```

### PORT

### Accessing envars

**TC_** prefix

## Migrate script tags

Copy script tag content into `public/index.html`. Change interpolated variables
into %TC_ENVAR% references.
