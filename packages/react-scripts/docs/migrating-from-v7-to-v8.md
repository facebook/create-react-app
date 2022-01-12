# Migrating from v7 to v8

Inside any created `backpack-react-scripts` project that has not been ejected, run:

```
npm install --save-dev @skyscanner/backpack-react-scripts@^8.0.0
```

## Breaking Changes

Like any major release, `backpack-react-scripts@8` contains a few breaking changes. At least one of them will affect every user, so please scan over these sections to see what is relevant to you.

### Upgrade to Jest 24

With this version brings the use of Jest `24.9.0`. Major Jest changes in [Jest v24](https://github.com/facebook/jest/blob/master/CHANGELOG.md#2400)

You will be required to upgrade to Jest 24 due to some incompatibilies with using mixed versions in BRS and your app, please ensure you upgrade your projects Jest version when you upgrade BRS.

If you encounter this error during build time then you will be required to make the move to Jest `24`.

```sh
There might be a problem with the project dependency tree.
It is likely not a bug in Create React App, but something you need to fix locally.

The backpack-react-scripts package provided by Create React App requires a dependency:

  "babel-jest": "^24.9.0"
```

### **New structure in `asset-manifest.json`**

All asset paths have been moved under the files key in `asset-manifest.json`.

This will require you to make changes to how you access files from the `asset-manifest` file.

If in your files you currently use the import similar to the following:

```
require('../../client/build/asset-manifest.json')
```

with the new version you will need to change it to the following so that it will correctly select the files generated:

```
require('../../client/build/asset-manifest.json').files
```

If you are mocking using these files in jest you will need to change the structure from:

```
jest.mock('../../../client/build/asset-manifest.json', () => ({ 'main.js': 'main.js', 'main.css': 'main.css' }));
```

to

```
jest.mock('../../../client/build/asset-manifest.json', () => ({ files: { 'main.js': 'main.js', 'main.css': 'main.css' } }));
```

## New features

### SRI (Subresource Integrity) Support

Backpack React Scripts now has the ability to support [SRI (Subresource Integrity)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) that allows for browsers to verify that resources they fetch (for example, from a CDN) are delivered without unexpected manipulation.

To use this and opt-in a new config option has been added - `sriEnabled`.
This flag sets if SRI is to be used during build to add integrity hash for files.

- **Note** if this is enabled, `crossOriginLoading` value is overriden with `anonymous` in order for it to output with the integrity value.

By default this feature is disabled and can be opted in should you wish to use this.

### Templating

With this version brings in a feature of create-react-app which is called `templates` this allows you to specify a custom template that will be used for the base of the webapp on generation in which we have created a standard template here under [cra-template-backpack](https://github.com/Skyscanner/cra-template-backpack/) - this repo contains the base standard Backpackified template as in BRS 7 but now separated.

As templates are the default method when creating react apps our command for running now looks like the following:

```sh
npx create-react-app my-app --scripts-version=@skyscanner/backpack-react-scripts --template @skyscanner/cra-template-backpack --use-npm
```

Where `@skyscanner/cra-template-backpack` is published to the NPM repository
