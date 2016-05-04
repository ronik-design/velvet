'use strict';

const velvet = require('../velvet');

const TOKENS = Symbol.for('tokens');

class Script extends velvet.File {

  constructor(options) {
    options.output = false;
    options.type = 'scripts';

    super(options);

    // Store
    Object.assign(this.data, {
      permalink: this.defaultValues.permalink
    });

    // Tokens
    Object.assign(this[TOKENS], {
      ':urlpath': velvet.config.scripts_path,
      ':output_ext': '.js'
    });
  }

  get minify() {
    // Minification
    const revisionEnvs = velvet.getConfig('scripts.minify.envs') || [];
    return revisionEnvs.indexOf(velvet.environment) >= 0;
  }
}

module.exports = Script;
