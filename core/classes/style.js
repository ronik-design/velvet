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
      ":hash": this.hash,
      ":urlpath": stencil.config.styles_path,
      ":output_ext": ".css"
    });
  }
}

module.exports = Style;
