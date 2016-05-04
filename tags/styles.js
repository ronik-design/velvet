'use strict';

const getStyle = function (site) {
  return function (relpath, options) {
    options = options || {};

    const style = site.getStyle(relpath);

    if (style) {
      style.output = true;
      return style;
    }
  };
};

const getUrl = function (site) {
  return function () {
    const style = getStyle(site)(...arguments);

    if (style) {
      return style.url;
    }
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
    const style = getStyle(context.env.globals.site)(relpath, options);

    if (!style) {
      return `<!-- stylesheet ${relpath} not found -->`;
    }

    return `<link rel='stylesheet' href='${style.url}' />`;
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
    const style = getStyle(context.env.globals.site)(relpath, options);

    if (!style) {
      return '';
    }

    return style.url;
  }
}

module.exports.install = function (env) {
  env.addExtension('StyleExtension', new StyleExtension());
  env.addExtension('StyleUrlExtension', new StyleUrlExtension());
  env.addFilter('style_url', getUrl(env.getGlobal('site')));
};
