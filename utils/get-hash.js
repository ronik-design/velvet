'use strict';

const crypto = require('crypto');
const sortKeys = require('sort-keys');

const getHash = function (arg, len) {
  let str;
  let hash;

  if (typeof arg === 'string') {
    str = arg;
  } else {
    str = JSON.stringify(sortKeys(arg));
  }

  hash = crypto.createHash('md5').update(str).digest('hex');

  if (len) {
    hash = hash.slice(0, len);
  }

  return hash;
};

module.exports = getHash;
