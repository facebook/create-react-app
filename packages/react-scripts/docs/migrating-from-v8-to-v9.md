# Migrating from v8 to v9

Inside any created `backpack-react-scripts` project that has not been ejected, run:

```
npm install --save-dev @skyscanner/backpack-react-scripts@
```

## Breaking Changes

Like any major release, `backpack-react-scripts@9` contains a few breaking changes. At least one of them will affect every user, so please scan over these sections to see what is relevant to you.

### Upgrade to Jest 26

With this version brings the use of Jest `26.6.0`. Major Jest changes in [Jest v26](https://github.com/facebook/jest/blob/master/CHANGELOG.md#2600)

The main breaking feature is `resetMocks` is now set to `true` by default in the Jest config.

**Note:**

You will be required to upgrade to Jest 26 due to some incompatibilies with using mixed versions in BRS and your app, please ensure you upgrade your projects Jest version when you upgrade BRS.

If you encounter this error during build time then you will be required to make the move to Jest `26`.

```sh
There might be a problem with the project dependency tree.
It is likely not a bug in Create React App, but something you need to fix locally.

The backpack-react-scripts package provided by Create React App requires a dependency:

  "babel-jest": "^26.6.0"
```

### Service works

BRS now uses the Workbox InjectManifest plugin over the GenerateSW plugin

## New features

A full list of new features and links can be found [here](https://github.com/facebook/create-react-app/releases/tag/v4.0.0)
