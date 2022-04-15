const clearConsole = require('react-dev-utils/clearConsole');
const chalk = require('chalk');

const isInteractive = process.stdout.isTTY;

/**
 * This class manages the output of multiple Webpack compilers to render a
 * rudimentary Terminal UI. It's designed to be used with
 * utils/customWebpackUtils.js#createCustomCompiler.
 *
 * Each Webpack compiler is represented by a CompilerUi instance, which can be
 * extended. Each CompilerUi instance has a name which is used to track its
 * output and label it in the UI.
 *
 * Several varieties of CompilerUi are provided for different use cases.
 *
 * See the start-ssr.js script for an example of it in action.
 *
 * @example
 * const ui = new MultiCompilerUi();
 *
 * // The create() method returns a basic, pre-registered CompilerUi
 * const simpleUi = ui.create('simple', { color: 'blue' });
 *
 * // You can extend CompilerUi to control behaviour
 * class MyCustomUi extends CompilerUi {
 *   log(message = '') {
 *     // Customise the log method
 *   }
 * }
 *
 * // CompilerUi instances must be registered before they're used.
 * const customUi = new MyCustomUi('custom', { color: 'green' });
 * ui.register(customUi);
 *
 * // No output is generated until start() is called.
 * ui.start();
 *
 * // The log() method appends output, the clear() method clears it.
 * simpleUi.log('Some info');
 * simpleUi.log('More info');
 * simpleUi.clear();
 * simpleUi.log('Fresh info');
 *
 * // CompilerUi output is independent
 * customUi.log('woah');
 * customUi.clear();
 */
class MultiCompilerUi {
  constructor() {
    this.output = {};
    this.compilers = {};
  }

  /**
   * Create and register a basic CompilerUi.
   *
   * @param {string} name - Used to label the compiler's output in the UI.
   * @param {CompilerUiOptions} options
   * @returns {CompilerUi}
   */
  create(name, options = {}) {
    const compiler = new CompilerUi(name, options);
    this.register(compiler);
    return compiler;
  }

  /**
   * Register a new CompilerUi instance. The instance can't be used until this
   * method is called.
   *
   * @param {CompilerUi} compiler
   * @returns {*}
   */
  register(compiler) {
    compiler.ui = this;
    this.compilers[compiler.name] = compiler;
    this.output[compiler.name] = '';

    compiler.start();
    return compiler;
  }

  append(name, message = '') {
    this.output[name] += message + '\n';
    this.render();
  }

  clear(name) {
    this.output[name] = '';

    // Don't render in non-interactive mode, so that we don't spam the console
    // with empty messages.
    if (isInteractive) {
      this.render();
    }
  }

  start() {
    this.started = true;
    this.render();
  }

  render() {
    if (!this.started) {
      return;
    }

    if (isInteractive) {
      clearConsole();

      // We only need a top border in interactive mode - in non-interactive mode
      // the bottom border demarcates builds.
      printBorder('=');
    }

    Object.entries(this.compilers).forEach(([name, { options }], index) => {
      const color = chalk.black[options.color];
      const label = isInteractive
        ? color(` ${options.label || name} `)
        : `[${options.label || name}]`;

      const message = this.output[name];
      console.log(
        message
          .trim()
          .split('\n')
          .map(line => `${label}  ${line}`)
          .join('\n')
      );

      // Build separator
      if (index < Object.keys(this.compilers).length - 1) {
        printBorder('-');
      }
    });

    // Bottom border
    printBorder('=');
  }
}

/**
 * @typedef {Object} CompilerUiOptions
 * @property {string} color - A chalk method used to style output e.g. yellow, bgBlue
 */

/**
 * The CompilerUi manages the output of a single Webpack compiler, and can pass
 * messages back to a MultiCompilerUi to be rendered.
 *
 * @property {string} name
 * @property {CompilerUiOptions} options
 * @property {MultiCompilerUi} [ui] - When a CompilerUi instance is passed to {@link MultiCompilerUi#register},
 *                                    the MultiCompilerUi instance is attached.
 */
class CompilerUi {
  constructor(name, options) {
    this.name = name;
    this.options = options;
  }

  /**
   * This method is called when the instance is registered with a MultiCompilerUi instance.
   * It provides an opportunity to log a message before the first Webpack compiler
   * event is received.
   */
  start() {
    this.log('Starting...');
    // We use this in log() to clear the initial message
    this.new = true;
  }

  log(message = '') {
    // We want to replace the initial starting message the first time we receive an event
    if (this.new) {
      this.clear();
      this.new = false;
    }

    this.ui.append(this.name, message);
  }

  clear() {
    this.ui.clear(this.name);
  }

  printInstructions() {}
}

/**
 * A CompilerUi extended to show CRA's instructions for using the WebpackDevServer.
 */
class WebCompilerUi extends CompilerUi {
  /**
   *
   * @param name
   * @param options
   * @param {Object} compilerConfig - Config object passed to createCustomCompiler
   * @param {string} compilerConfig.appName
   * @param {Object} compilerConfig.urls
   * @param {boolean} compilerConfig.useYarn
   */
  constructor(name, options, compilerConfig) {
    super(name, options);
    this.compilerConfig = compilerConfig;
  }

  /**
   * This function is taken directly from react-dev-utils/WebpackDevServerUtils.js,
   * with all `console.log` references replaced with `this.log`.
   */
  printInstructions() {
    const { appName, urls, useYarn } = this.compilerConfig;

    this.log();
    this.log(`You can now view ${chalk.bold(appName)} in the browser.`);
    this.log();

    if (urls.lanUrlForTerminal) {
      this.log(
        `  ${chalk.bold('Local:')}            ${urls.localUrlForTerminal}`
      );
      this.log(
        `  ${chalk.bold('On Your Network:')}  ${urls.lanUrlForTerminal}`
      );
    } else {
      this.log(`  ${urls.localUrlForTerminal}`);
    }

    this.log();
    this.log('Note that the development build is not optimized.');
    this.log(
      `To create a production build, use ` +
        `${chalk.cyan(`${useYarn ? 'yarn' : 'npm run'} build`)}.`
    );
    this.log();
  }
}

function printBorder(char) {
  console.log();
  console.log(char.repeat(process.stdout.columns || 30));
  console.log();
}

/**
 * A CompilerUi designed to be used inside a forked process. It sends messages
 * to its parent process with process.send. By convention it will send a "clear"
 * message to denote the clear() method.
 */
class ProcessSendCompilerUi extends CompilerUi {
  constructor() {
    super();
  }

  log(message = '') {
    process.send(message);
  }

  clear() {
    process.send('clear');
  }
}

/**
 * A CompilerUi designed to receive messages from a ProcessSendCompilerUi. Use
 * this instance in the parent process.
 */
class ProcessMessageCompilerUi extends CompilerUi {
  constructor(childProcess, name, options) {
    super(name, options);

    childProcess.on('message', this.onMessage.bind(this));
  }

  onMessage(message) {
    if (message === 'clear') {
      this.clear();
    } else {
      this.log(message);
    }
  }
}

/**
 * A CompilerUi that just logs messages - useful for debugging.
 */
class DebugCompilerUi extends CompilerUi {
  constructor() {
    super();
  }

  log(message = '') {
    console.log(message);
  }

  clear() {}
}

module.exports = {
  MultiCompilerUi,
  WebCompilerUi,
  ProcessSendCompilerUi,
  ProcessMessageCompilerUi,
  DebugCompilerUi,
};
