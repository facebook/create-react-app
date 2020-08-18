# Website

This website is built using [Docusaurus v2](https://github.com/facebook/docusaurus), a modern static website generator.

### Installation

```sh
$ yarn
```

### Local Development

```sh
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```sh
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

```sh
$ GIT_USER=<Your GitHub username> USE_SSH=1 yarn deploy
```

If you are using [GitHub Pages](https://pages.github.com/) for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
