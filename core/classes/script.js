"use strict";

const stencil = require("../stencil");

const TOKENS = Symbol.for("tokens");

class Script extends stencil.File {

  constructor(options) {

    options.output = false;
    options.type = "scripts";

    super(options);

    // Store
    Object.assign(this.data, {
      permalink: this.defaultValues.permalink
    });

    // Tokens
    Object.assign(this[TOKENS], {
      ":urlpath": stencil.config.scripts_path,
      ":output_ext": ".js"
    });
  }

  get minify() {

    // Minification
    const revisionEnvs = stencil.getConfig("scripts.minify.envs") || [];
    return revisionEnvs.indexOf(stencil.environment) >= 0;
  }
}

module.exports = Script;
