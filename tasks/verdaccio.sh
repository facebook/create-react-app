#!/bin/bash

custom_registry_url=http://localhost:4873
original_npm_registry_url=`npm get registry`
original_yarn_registry_url=`yarn config get registry`

function startVerdaccio {
  # Start local registry
  tmp_registry_log=`mktemp`
  (cd && nohup npx https://createreactapp.blob.core.windows.net/lib/verdaccio-4.0.0-alpha.8.tgz -c $1 &>$tmp_registry_log &)
  # Wait for `verdaccio` to boot
  grep -q 'http address' <(tail -f $tmp_registry_log)

  # Set registry to local registry
  npm set registry "$custom_registry_url"
  yarn config set registry "$custom_registry_url"

  # Login so we can publish packages
  (cd && npx npm-auth-to-token@1.0.0 -u user -p password -e user@example.com -r "$custom_registry_url")
}

function restoreRegistryUrls {
  cat $tmp_registry_log
  
  npm set registry "$original_npm_registry_url"
  yarn config set registry "$original_yarn_registry_url"
}
