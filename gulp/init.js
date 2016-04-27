"use strict";

const through = require("through2");
const gulpUtil = require("gulp-util");
const PluginError = gulpUtil.PluginError;

const PLUGIN_NAME = "stencil-init";

const gulpInit = function (stencil) {

  return function (options) {

    options = options || {};

    const site = stencil.site;

    const transform = function (file, enc, cb) {

      if (file.isNull()) {
        return cb(null, file);
      }

      if (file.isStream()) {
        return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
      }

      const obj = site.getObject(file.path);

      file.stencilObj = obj;

      if (options.variant && obj.variants) {
        file.stencilVariant = obj.variants[options.variant];
      }

      cb(null, file);
    };

    return through.obj(transform);
  };
};

module.exports = gulpInit;
