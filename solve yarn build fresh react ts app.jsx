// Here's how I solved this temporarily until react-scripts@4.01 is released.

// 1.Place a file in your package root called verifyTypeScriptSetup.js that contains the following

"use strict";
function verifyTypeScriptSetup() {}
module.exports = verifyTypeScriptSetup;

// 2. Add the following prestart to your scripts in package.json

"prestart": "cp verifyTypeScriptSetup.js node_modules/react-scripts/scripts/utils",

// Now when you run npm start the errant verifyTypeScriptSetup.js in node_modules is patched.

// Note: This bypasses all of CRA's checking for a valid tsconfig.json, so you better know what you're doing. Also, be sure to remove this line AFTER you migrate to react-scripts@4.01.
