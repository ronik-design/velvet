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
      ":hash": this.hash,
      ":urlpath": stencil.config.scripts_path,
      ":output_ext": ".js"
    });
  }
}

module.exports = Script;
