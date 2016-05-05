'use strict';

const url = require('url');

const getScriptUrl = function (site) {
  return function (relpath, options) {
    options = options || {};

    const parsed = url.parse(relpath);
    const script = site.getScript(parsed.pathname);

    let bundle;

    if (typeof options === 'string') {
      if (options === 'bundle') {
        bundle = true;
      }
    } else {
      bundle = options.bundle;
    }

    if (script) {
      script.output = true;
      script.bundle = bundle;
      return `${script.url}${parsed.search || ''}${parsed.hash || ''}`;
    }

    return relpath;
  };
};

class ScriptExtension {

  constructor() {
    this.tags = ['script'];
  }

  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  run(context, relpath, options) {
    const scriptUrl = getScriptUrl(context.env.globals.site)(relpath, options);
    return `<script src='${scriptUrl}' type='text/javascript'></script>`;
  }
}

class ScriptUrlExtension {

  constructor() {
    this.tags = ['script_url'];
  }

  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  run(context, relpath, options) {
    return getScriptUrl(context.env.globals.site)(relpath, options);
  }
}

module.exports.install = function (env) {
  env.addExtension('ScriptExtension', new ScriptExtension());
  env.addExtension('ScriptUrlExtension', new ScriptUrlExtension());
  env.addFilter('script_url', getScriptUrl(env.getGlobal('site')));
};
