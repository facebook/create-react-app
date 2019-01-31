class CustomFilterPlugin {
  constructor({ exclude }) {
    this.exclude = exclude;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('CustomFilterPlugin', compilation => {
      compilation.warnings = compilation.warnings.filter(warning => !this.exclude.test(warning.message));
    });
  }
};

module.exports = CustomFilterPlugin;
