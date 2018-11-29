module.exports.default = () => {
  return `#!/usr/bin/env bash

rm -rf build

# 构建正常的 App
REACT_APP_SCM_VERSION=$BUILD_VERSION \\
  REACT_APP_VERSION_NUMBER=$(git rev-parse HEAD) \\
  REACT_APP_BUILD_TIME=$(date) \\
  npx byted-react-scripts build
`;
};
