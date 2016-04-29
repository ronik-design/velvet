"use strict";

const path = require("path");
const through = require("through2");
const File = require("vinyl");
const gutil = require("gulp-util");
const PluginError = gutil.PluginError;

const PLUGIN_NAME = "velvet-init";

const init = function (velvet) {

  return function (filepath) {

    const transform = function (file, enc, cb) {

      if (file.isNull()) {
        return cb(null, file);
      }

      if (file.isStream()) {
        return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
      }

      filepath = filepath || path.resolve(file.base, file.path);

      const obj = velvet.site.getObject(filepath);

      if (obj) {

        file.destination = obj.destination;
        file.revision = obj.revision;

        if (obj.variants) {
          for (const variant in obj.variants) {
            /* eslint-disable */
            this.push(new File({
              contents: file.contents,
              path: file.path,
              base: file.base,
              destination: variant.destination,
              revision: variant.revision
            }));
            /* eslint-enable */
          }
        }
      }

      cb(null, file);
    };

    return through.obj(transform);
  };
};

module.exports = init;
