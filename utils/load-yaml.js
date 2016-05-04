'use strict';

const fs = require('fs');
const yaml = require('js-yaml');

const loadYaml = function (filepath, options) {
  const enc = options.encoding ? options.encoding.replace('-', '') : 'utf8';

  let doc;

  try {
    const file = fs.readFileSync(filepath, enc);
    doc = yaml.safeLoad(file);
  } catch (e) {
    doc = null;
  }

  return doc;
};

module.exports = loadYaml;
