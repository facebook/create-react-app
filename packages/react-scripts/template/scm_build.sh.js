module.exports.default = pkgName => {
  return `#!/usr/bin/env bash

mkdir output
yarn run build

rm -rf scm_build_resource.sh
rm -rf cdn_resources && mkdir cdn_resources
cp -r build cdn_resources/$BUILD_VERSION

echo "RESOURCE_ONLINE_DIR=\"/opt/tiger/static/ies/${pkgName}\"" >> scm_build_resource.sh
echo "RESOURCE_ONLINE_MACHINES='system.cdn.static'" >> scm_build_resource.sh
echo "echo \"./cdn_resources\"" >> scm_build_resource.sh`;
};
