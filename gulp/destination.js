'use strict';

const through = require('through2');
const path = require('path');
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;

const PLUGIN_NAME = 'velvet-destination';

const destination = function (opts) {
  opts = opts || {};

  const transform = function (file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    if (!file.destination) {
      return cb(null, file);
    }

    if (opts.restore) {
      file.path = file.originalPath;
    } else {
      file.originalPath = file.path;
      file.path = path.join(file.base, file.destination);
    }

    cb(null, file);
  };

  return through.obj(transform);
};

module.exports = destination;
