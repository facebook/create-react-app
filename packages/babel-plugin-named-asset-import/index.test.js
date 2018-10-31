const pluginTester = require('babel-plugin-tester');
const namedAssetImport = require('./index');

pluginTester({
  plugin: namedAssetImport,
  pluginOptions: {
    loaderMap: {
      svg: {
        ReactComponent: '@svgr/webpack?-prettier,-svgo![path]',
      },
    },
  },
  pluginName: 'named-asset-import',
  snapshot: false,
  tests: {
    defaultImport: {
      code: 'import logo from "logo";',
      output: 'import logo from "logo";',
    },
    namedImport: {
      code: 'import { logo } from "logo";',
      output: 'import { logo } from "logo";',
    },
    namedImportRenamed: {
      code: 'import { Url as logo1 } from "logo";',
      output: 'import { Url as logo1 } from "logo";',
    },
    svgDefaultImport: {
      code: 'import logo from "logo.svg";',
      output: 'import logo from "logo.svg";',
    },
    svgNamedImport: {
      code: 'import { logo } from "logo.svg";',
      output: 'import { logo } from "logo.svg";',
    },
    svgReactComponentNamedImport: {
      code: 'import { ReactComponent as logo } from "logo.svg";',
      output:
        'import { ReactComponent as logo } from "@svgr/webpack?-prettier,-svgo!logo.svg";',
    },
    svgMultipleImport: {
      code:
        'import logo, { logoUrl , ReactComponent as Logo } from "logo.svg";',
      output:
        'import logo from "logo.svg";\n' +
        'import { logoUrl } from "logo.svg";\n' +
        'import { ReactComponent as Logo } from "@svgr/webpack?-prettier,-svgo!logo.svg";',
    },
  },
});
