## How to use on a new app

```bash
npx create-react-app {app-name} --scripts-version @familysearch/react-scripts
```

## How to test your local copy of react-scripts

- We found that creating a new react-app through this command could utilize your local react-scripts
  - You'll just need to change the path to your react-scripts version.
  - `npx create-react-app cra-test --scripts-version file:create-react-app/packages/react-scripts`

## How to make a Release

- When the "develop" branch is ready to merge into frontierMaster for a release
- run `npm release (patch|minor|major)`
- make a PR to the `frontierMaster` branch and be sure to squash all the commits into a single commit.
