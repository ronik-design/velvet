'use strict';

const relPath = function (base, filepath) {
  return filepath.replace(base, '').replace(/^\//, '');
};

module.exports = relPath;
