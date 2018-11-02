## How to test your local copy of react-scripts

- We found that creating a new react-app through this command could utilize your local react-scripts
  - You'll just need to change the path to your react-scripts version.
  - `npx create-react-app polyer-cra-test --scripts-version file:create-react-app/packages/react-scripts`

## How to make a Release

- When the "develop" branch is ready to merge into frontierMaster for a release, make a PR and be sure to squash all the commits into a single commit.
- Create a tag on frontierMaster named `${SemverVersionOfFacebooksRelease}-frontier-${SemverVersionOfFrontiersRelease}`
- Push that newly created tag up to github with `git push origin ${nameOfTagFromAbove}`
- Travis will automatically catch that new tag, and create a tar file of react-scripts and upload it to the corresponding release on github.
