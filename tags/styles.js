"use strict";

const TAG_NAME = "styles";

const getStyle = function (site) {

  return function (relpath, options) {

    options = options || {};

    const style = site.getStyle(relpath);

    if (style) {
      style.copy = true;
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

class StylesExtension {

  constructor() {

    this.tags = [TAG_NAME];
  }

  parse(parser, nodes) {

    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, "run", args);
  }

  run(context, relpath, options) {

    const style = getStyle(context.env.globals.site)(relpath, options);

    if (!style) {
      return `<!-- stylesheet ${relpath} not found -->`;
    }

    return `<link rel="stylesheet" href="${style.url}" />`;
  }
}

module.exports = StylesExtension;

module.exports.install = function (env) {
  env.addExtension("StylesExtension", new StylesExtension());
  env.addFilter(TAG_NAME, getUrl(env.getGlobal("site")));
};
