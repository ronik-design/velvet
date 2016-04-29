"use strict";

const through = require("through2");
const File = require("vinyl");
const gutil = require("gulp-util");
const PluginError = gutil.PluginError;

const PLUGIN_NAME = "velvet-destination";

const destination = function (velvet) {

  return function () {

    const transform = function (file, enc, cb) {

      if (file.isNull()) {
        return cb(null, file);
      }

      if (file.isStream()) {
        return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
      }

      if (!file.destination) {
        return cb(null, file);
      }

      file.originalPath = file.path;

      file.path = path.join(velvet.config.build_dir, file.destination);

      cb(null, file);
    };

    return through.obj(transform);
  };
};

module.exports = destination;
