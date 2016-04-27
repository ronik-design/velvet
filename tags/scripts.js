"use strict";

const TAG_NAME = "scripts";

const getScript = function (site) {

  return function (relpath, options) {

    options = options || {};

    const script = site.getScript(relpath);

    let bundle;

    if (typeof options === "string") {
      if (options === "bundle") {
        bundle = true;
      }
    } else {
      bundle = options.bundle;
    }

    if (script) {
      script.output = true;
      script.bundle = bundle;
      return script;
    }
  };
};

const getUrl = function (site) {

  return function () {

    const script = getScript(site)(...arguments);

    if (script) {
      return script.url;
    }
  };
};

class ScriptsExtension {

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

    const script = getScript(context.env.globals.site)(relpath, options);

    if (!script) {
      return `<!-- script ${relpath} not found -->`;
    }

    return `<script src="${script.url}" type="text/javascript"></script>`;
  }
}

module.exports = ScriptsExtension;

module.exports.install = function (env) {
  env.addExtension("ScriptsExtension", new ScriptsExtension());
  env.addFilter(TAG_NAME, getUrl(env.getGlobal("site")));
};
