import pluginTester from 'babel-plugin-tester';
import namedAssetImport from './index';

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
      code: 'import foo from "foo";',
      output: 'import foo from "foo";',
    },
    namedImport: {
      code: 'import { foo } from "foo";',
      output: 'import { foo } from "foo";',
    },
    namedImportRenamed: {
      code: 'import { foo as foo1 } from "foo.svg";',
      output: 'import { foo as foo1 } from "foo.svg";',
    },
    svgNamedImport: {
      code: 'import { Url as foo1 } from "foo.svg";',
      output: 'import { Url as foo1 } from "foo.svg";',
    },
    svgReactComponentNamedImport: {
      code: 'import { ReactComponent as foo1 } from "foo.svg";',
      output:
        'import { ReactComponent as foo1 } from "@svgr/webpack?-prettier,-svgo!foo.svg";',
    },

    defaultExport: {
      code: 'export * from "foo";',
      output: 'export * from "foo";',
    },
    namedExport: {
      code: 'export { foo } from "foo";',
      output: 'export { foo } from "foo";',
    },
    namedExportRenamed: {
      code: 'export { foo as foo1 } from "foo.svg";',
      output: 'export { foo as foo1 } from "foo.svg";',
    },
    svgNamedExport: {
      code: 'export { Url as foo1 } from "foo.svg";',
      output: 'export { Url as foo1 } from "foo.svg";',
    },
    svgReactComponentNamedExport: {
      code: 'export { ReactComponent as foo1 } from "foo.svg";',
      output:
        'export { ReactComponent as foo1 } from "@svgr/webpack?-prettier,-svgo!foo.svg";',
    },
  },
});
