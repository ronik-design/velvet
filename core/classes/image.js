"use strict";

const getImageDimensions = require("../../utils/get-image-dimensions");
const velvet = require("../velvet");
const ImageVariant = require("./image-variant");

const TOKENS = Symbol.for("tokens");

class Image extends velvet.File {

  constructor(options) {

    if (velvet.config.images.hasOwnProperty("copy")) {
      options.output = velvet.config.images.copy;
    }

    options.type = "images";

    super(options);

    // Tokens
    Object.assign(this[TOKENS], {
      ":urlpath": velvet.config.images_path
    });

    // Store
    Object.assign(this.data, {
      permalink: this.defaultValues.permalink,
      dimensions: null,
      variants: {}
    });
  }

  get height() {

    if (this.data.dimensions && this.data.dimensions.hasOwnProperty("height")) {
      return this.data.dimensions.height;
    }

    this.data.dimensions = getImageDimensions(this.filepath);

    return this.data.dimensions.height;
  }

  get width() {

    if (this.data.dimensions && this.data.dimensions.hasOwnProperty("width")) {
      return this.data.dimensions.width;
    }

    this.data.dimensions = getImageDimensions(this.filepath);

    return this.data.dimensions.width;
  }

  get variants() {

    return this.data.variants;
  }

  addVariant(filters) {

    const variant = new ImageVariant({
      path: this.path,
      filepath: this.filepath,
      collection: this.collection,
      filters
    });

    if (!this.data.variants[variant.filters_hash]) {
      this.data.variants[variant.filters_hash] = variant;
    }

    return this.data.variants[variant.filters_hash];
  }
}

module.exports = Image;
