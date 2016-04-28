"use strict";

const stencil = require("../stencil");

const TOKENS = Symbol.for("tokens");

class Style extends stencil.File {

  constructor(options) {

    options.output = false;
    options.type = "styles";

    super(options);

    // Store
    Object.assign(this.data, {
      permalink: this.defaultValues.permalink
    });

    // Tokens
    Object.assign(this[TOKENS], {
      ":urlpath": stencil.config.styles_path,
      ":output_ext": ".css"
    });
  }

  get minify() {

    // Minification
    const revisionEnvs = stencil.getConfig("styles.minify.envs") || [];
    return revisionEnvs.indexOf(stencil.environment) >= 0;
  }
}

module.exports = Style;
