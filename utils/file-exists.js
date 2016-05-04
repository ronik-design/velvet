'use strict';

const fs = require('fs');

const fileExists = function (filepath) {
  let exists;

  try {
    fs.accessSync(filepath, fs.F_OK);
    exists = true;
  } catch (e) {
    exists = false;
  }

  return exists;
};

module.exports = fileExists;
