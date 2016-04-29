"use strict";

const through = require("through2");
const gulpUtil = require("gulp-util");
const PluginError = gulpUtil.PluginError;

const PLUGIN_NAME = "velvet-init";

const gulpInit = function (velvet) {

  return function (options) {

    options = options || {};

    const site = velvet.site;

    const transform = function (file, enc, cb) {

      if (file.isNull()) {
        return cb(null, file);
      }

      if (file.isStream()) {
        return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
      }

      const obj = site.getObject(file.path);

      file.velvetObj = obj;

      if (options.variant && obj.variants) {
        file.velvetVariant = obj.variants[options.variant];
      }

      cb(null, file);
    };

    return through.obj(transform);
  };
};

module.exports = gulpInit;
