'use strict';

const fs = require('fs');
const yaml = require('js-yaml');

const FRONT_MATTER_RE = /^(-{3,}|;{3,})\n([\s\S]+?)?\n?\1(?:$|\n([\s\S]*)$)/;
const FRONT_MATTER_POS = 2;
const CONTENT_POS = 3;

const loadWithFrontMatter = function (filepath, options) {
  const enc = options.encoding ? options.encoding.replace('-', '') : 'utf8';

  let doc;

  try {
    const file = fs.readFileSync(filepath, enc);
    const match = file.match(FRONT_MATTER_RE);

    doc = {filepath};

    if (match) {
      doc.data = yaml.safeLoad(match[FRONT_MATTER_POS] || '');
      doc.content = match[CONTENT_POS];
    } else {
      doc.content = file;
    }
  } catch (e) {
    doc = null;
  }

  return doc;
};

module.exports = loadWithFrontMatter;
