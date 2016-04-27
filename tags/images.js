"use strict";

const qs = require("qs");

const TAG_NAME = "images";

class Images {

  constructor() {

    this.tags = [TAG_NAME];
  }

  parse(parser, nodes) {

    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, "run", args);
  }

  run(context, relpath, filters) {

    filters = filters || {};

    if (typeof filters === "string") {
      filters = qs.parse(filters);
    }

    const site = context.env.globals.site;
    const image = site.getImage(relpath);

    if (!image) {
      return `<!-- image ${relpath} not found -->`;
    }

    let url = image.url;

    if (Object.keys(filters).length > 0) {
      url = image.addVariant(filters).url;
    } else {
      image.output = true;
    }

    return url;
  }
}

module.exports = Images;

module.exports.install = function (env) {
  env.addExtension("Images", new Images());
};
