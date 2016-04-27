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
      permalink: stencil.config.styles.permalink
    });

    // Tokens
    Object.assign(this[TOKENS], {
      ":urlpath": stencil.config.styles_path,
      ":output_ext": ".css"
    });
  }
}

module.exports = Style;
