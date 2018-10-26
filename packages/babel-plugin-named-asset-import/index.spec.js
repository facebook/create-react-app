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
  },
});
