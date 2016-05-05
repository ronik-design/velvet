'use strict';

const url = require('url');
const qs = require('qs');

const getImageUrl = function (site) {
  return function (relpath, filters) {
    const parsed = url.parse(relpath);
    filters = filters || {};

    if (typeof filters === 'string') {
      filters = qs.parse(filters);
    }

    const image = site.getImage(parsed.pathname);

    if (!image) {
      return relpath;
    }

    let imageUrl = image.url;

    if (Object.keys(filters).length > 0) {
      imageUrl = image.addVariant(filters).url;
    } else {
      image.output = true;
    }

    return `${imageUrl}${parsed.search || ''}${parsed.hash || ''}`;
  };
};

class ImageUrlExtension {

  constructor() {
    this.tags = ['image_url'];
  }

  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  run(context, relpath, filters) {
    return getImageUrl(context.env.globals.site)(relpath, filters);
  }
}

module.exports.install = function (env) {
  env.addExtension('ImageUrlExtension', new ImageUrlExtension());
  env.addFilter('image_url', getImageUrl(env.getGlobal('site')));
};
