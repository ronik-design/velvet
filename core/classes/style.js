'use strict';

const velvet = require('../velvet');

const TOKENS = Symbol.for('tokens');

class Style extends velvet.File {

  constructor(options) {
    options.output = false;
    options.type = 'styles';

    super(options);

    // Store
    Object.assign(this.data, {
      permalink: this.defaultValues.permalink
    });

    // Tokens
    Object.assign(this[TOKENS], {
      ':urlpath': velvet.config.styles_path,
      ':output_ext': '.css'
    });
  }

  get minify() {
    // Minification
    const revisionEnvs = velvet.getConfig('styles.minify.envs') || [];
    return revisionEnvs.indexOf(velvet.environment) >= 0;
  }
}

module.exports = Style;
