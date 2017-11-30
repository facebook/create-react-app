"use strict";

module.exports = function(api, opts) {
  if (!opts) {
    opts = {};
  }

  var env = process.env.BABEL_ENV || process.env.NODE_ENV;

  // if (env !== "development" && env !== "test" && env !== "production") {
  //   throw new Error(
  //     "Using `babel-preset-react-app` requires that you specify `NODE_ENV` or " +
  //       '`BABEL_ENV` environment variables. Valid values are "development", ' +
  //       '"test", and "production". Instead, received: ' +
  //       JSON.stringify(env) +
  //       "."
  //   );
  // }
  console.log("babel-preset-react-app says hi");

//   return {
//     presets: [
//       [
//         require.resolve('babel-preset-env'),
//         {
//           targets: {
//             node: 'current',
//           },
//         },
//       ],
//       [require.resolve("@babel/preset-react"), { development: true }]
//     ],
//     plugins: [
//       require.resolve("@babel/plugin-proposal-class-properties"),
//       [
//         require.resolve("@babel/plugin-transform-react-jsx"),
//         {
//           useBuiltIns: true
//         }
//       ],
//       [
//         require.resolve("@babel/plugin-transform-runtime"),
//         {
//           helpers: false,
//           polyfill: false,
//           regenerator: true
//         }
//       ]
//     ].filter(Boolean)
//   };
// };

  return {
    presets: [
      [
        require('@babel/preset-env').default,
        {
          targets: {
            // React parses on ie 9, so we should too
            ie: 9,
            // We currently minify with uglify
            // Remove after https://github.com/mishoo/UglifyJS2/issues/448
            forceAllTransforms: true,
          },
        },
      ],
      [require("@babel/preset-react").default, { development: true }],
      [require("@babel/preset-flow").default]
    ],
    plugins: [
      [
        require("@babel/plugin-proposal-object-rest-spread").default
      ],
      [
        require("@babel/plugin-proposal-class-properties").default
      ],
      [
        require("@babel/plugin-transform-runtime").default,
        {
          helpers: false,
          polyfill: false,
          regenerator: true
        }
      ]
    ]
  };
};
