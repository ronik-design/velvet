'use strict';

const url = require('url');

const getStyleUrl = function (site) {
  return function (relpath, options) {
    options = options || {};

    const parsed = url.parse(relpath);
    const style = site.getStyle(parsed.pathname);

    if (style) {
      style.output = true;
      return `${style.url}${parsed.search || ''}${parsed.hash || ''}`;
    }

    return relpath;
  };
};

class StyleExtension {

  constructor() {
    this.tags = ['style'];
  }

  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  run(context, relpath, options) {
    const styleUrl = getStyleUrl(context.env.globals.site)(relpath, options);
    return `<link rel='stylesheet' href='${styleUrl}' />`;
  }
}

class StyleUrlExtension {

  constructor() {
    this.tags = ['style_url'];
  }

  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  run(context, relpath, options) {
    return getStyleUrl(context.env.globals.site)(relpath, options);
  }
}

module.exports.install = function (env) {
  env.addExtension('StyleExtension', new StyleExtension());
  env.addExtension('StyleUrlExtension', new StyleUrlExtension());
  env.addFilter('style_url', getStyleUrl(env.getGlobal('site')));
};
