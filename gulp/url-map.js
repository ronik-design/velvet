"use strict";

const through = require("through2");
const gulpUtil = require("gulp-util");
const PluginError = gulpUtil.PluginError;

const PLUGIN_NAME = "velvet-url-map";

const gulpMap = function (options) {

  const transform = function (file, enc, cb) {

    if (!options || file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
    }

    file.oldUrl = options.oldUrl;
    file.newUrl = options.newUrl;

    cb(null, file);
  };

  return through.obj(transform);
};

module.exports = gulpMap;
