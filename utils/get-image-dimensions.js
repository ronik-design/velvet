'use strict';

const sizeOf = require('image-size');

const getImageDimensions = function (filepath) {
  let dimensions = {height: 0, width: 0};

  try {
    dimensions = sizeOf(filepath);
  } catch (e) {
    dimensions = {height: -1, width: -1};
  }

  return dimensions;
};

module.exports = getImageDimensions;
