"use strict";

const SubresourceIntegrityPlugin = require("webpack-subresource-integrity");
const paths = require("../config/paths");
const appPackageJson = require(paths.appPackageJson);
const bpkReactScriptsConfig = appPackageJson["backpack-react-scripts"] || {};
const sriEnabled = bpkReactScriptsConfig.sriEnabled || false;

module.exports = () => {
  return (
    // Calculate and inject Subresource Integrity (SRI) hashes
    // https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
    // This is a security feature that enables browsers to verify that resources
    // they fetch (for example, from a CDN) are delivered without unexpected manipulation.
    sriEnabled &&
    new SubresourceIntegrityPlugin({
      enabled: true,
      hashFuncNames: ["sha384"],
    })
  );
};
