"use strict";

const qs = require("qs");
const getHash = require("../../utils/get-hash");

const stencil = require("../stencil");
const File = require("./file");

const TOKENS = Symbol.for("tokens");

const HASH_LENGTH = 12;

class ImageVariant extends File {

  constructor(options) {

    options.type = "images";
    options.output = true;

    super(options);

    // Store
    Object.assign(this.data, {
      permalink: this.defaultValues.permalink,
      filters: options.filters,
      filters_hash: getHash(options.filters, HASH_LENGTH)
    });

    // Tokens
    Object.assign(this[TOKENS], {
      ":filters": qs.stringify(this.filters),
      ":filters_hash": this.filters_hash,
      ":urlpath": stencil.config.images_path
    });
  }

  get filters() {
    return this.data.filters;
  }

  get filters_hash() {
    return this.data.filters_hash;
  }
}

module.exports = ImageVariant;
