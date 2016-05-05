'use strict';

const url = require('url');

const getFileUrl = function (site) {
  return function (relpath) {
    const parsed = url.parse(relpath);
    const file = site.getFile(parsed.pathname);

    if (file) {
      file.output = true;
      return `${file.url}${parsed.search || ''}${parsed.hash || ''}`;
    }

    return relpath;
  };
};

class FileUrlExtension {

  constructor() {
    this.tags = ['file_url'];
  }

  parse(parser, nodes) {
    const tok = parser.nextToken();
    const args = parser.parseSignature(null, true);

    parser.advanceAfterBlockEnd(tok.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  run(context, relpath) {
    return getFileUrl(context.env.globals.site)(relpath);
  }
}

module.exports.install = function (env) {
  env.addExtension('FileExtension', new FileUrlExtension());
  env.addFilter('file_url', getFileUrl(env.getGlobal('site')));
};
