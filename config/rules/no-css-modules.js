/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports = {
  create: function (context) {
    return {
      ImportDeclaration: function(node) {
        if (node) {
          var specifiers = node.specifiers || [];
          var value = node.source && node.source.value;

          if (value.indexOf('.css') !== -1 && specifiers.length) {
            for (var i = 0; i < specifiers.length; i++) {
              var specifier = specifiers[i];

              context.report(specifier, 'CSS modules import is restricted. ' +
                'Please remove the \'{{importName}}\' portion of the import.', {
                importName: specifier.imported ? specifier.imported.name : specifier.local.name
              });
            }
          }
        }
      }
    };
  }
};
