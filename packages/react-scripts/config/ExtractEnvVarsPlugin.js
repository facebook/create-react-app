'use strict';

class ExtractEnvVarsPlugin {
  constructor() {
    this.vars = [];
  }

  shouldProcessModule(module) {
    return (
      module._source && module._source._value && /\.js$/.test(module.resource)
    );
  }

  findMatchesInFile(fileContent) {
    const vars = this.vars;
    const regExp = /env(?:Flag|Url|Var)\(\s*["']([A-Z0-9_]+)["']/g;
    let match = null;

    while ((match = regExp.exec(fileContent)) !== null) {
      if (vars.indexOf(match[1]) < 0) {
        vars.push(match[1]);
      }
    }
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('ExtractEnvVarsPlugin', compilation => {
      compilation.hooks.optimizeChunks.tap('ExtractEnvVarsPlugin', chunks => {
        chunks.forEach(chunk => {
          const modules = Array.from(chunk._modules);
          modules.filter(this.shouldProcessModule).forEach(module => {
            const content = fs.readFileSync(module.resource).toString();
            this.findMatchesInFile(content);
          });
        });
      });
    });

    compiler.hooks.emit.tapAsync(
      'ExtractEnvVarsPlugin',
      (compilation, callback) => {
        compilation.assets['envVars'] = {
          source: () => this.vars.join('\n'),
          size: () => this.vars.length,
        };
        callback();
      }
    );
  }
}

module.exports = ExtractEnvVarsPlugin;
