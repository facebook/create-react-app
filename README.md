# Neverbuild

Kickstarts a new React app - fork of [Create React App](https://github.com/facebookincubator/create-react-app/)

* [User Guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md) – How to develop apps bootstrapped with Create React App.

## Features

* Create React App features + ...
* React Router
* SCSS
* SVG sprites
* Assets optimisation (png, jpg, svg, ...)
* Automatic polyfilling (using Polyfill.io)

## Getting started

- Install: `npm install`
- Start dev: `npm start`
- Production build: `npm run build`

## Testing

- Lint SCSS: `npm run lint:scss`

## Writing CSS

We use [BEM](https://en.bem.info/) across our projects.

## Polyfills

We use [Polyfill.io](https://polyfill.io/v2/docs/) to polyfill missing Javascript functionality. Simply add any missing functionality by appending the polyfill.io url in `src/public/index.html` with the feature you need.

## Recommended Tools

- ESLint ([Atom Plugin](https://atom.io/packages/linter-eslint)/[Sublime Plugin](https://github.com/roadhump/SublimeLinter-eslint))
- SASS Lint ([Atom Plugin](https://atom.io/packages/linter-sass-lint)/[Sublime Plugin](https://github.com/skovhus/SublimeLinter-contrib-sass-lint))
- Beautifier ([Atom Plugin](https://atom.io/packages/atom-beautify))

## License

[MIT license](http://opensource.org/licenses/MIT)

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
