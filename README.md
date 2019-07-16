# AM Create React App

This is a fork of [Create React App](https://github.com/facebook/create-react-app). It does all the same things, except it will build two separate React apps for the Aspen Mesh Self Hosted UI and the Customer Portal UI depending on the LOCATION environment variable.

### Updating

- Make changes as necessary
- Bump the semver in `package.json`
- Run `npm publish --access public`
- Bump and install the newest version in [Client UI](https://github.com/aspenmesh/client-ui).

Best work flow I've found, is to develop changes in the aspen-mesh-react-scripts installed in client ui node_modules until you have them right. It's best to minimize the amount of version bumps and npm publish events.
