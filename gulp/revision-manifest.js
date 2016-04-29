"use strict";

const path = require("path");
const File = require("vinyl");
const vinylFile = require("vinyl-file");
const sortKeys = require("sort-keys");
const through = require("through2");
const relPath = require("../utils/rel-path");

const PLUGIN_NAME = "velvet-revision-manifest";

const getManifestFile = function (options) {

  let file;

  try {
    file = vinylFile.readSync(options.path, options);
  } catch (err) {
    file = new File(options);
  }

  return file;
};

const revisionManifest = function (filepath, options) {

  if (typeof filepath === "string") {
    filepath = { path: filepath };
  }

  options = Object.assign({
    path: "revision-manifest.json",
    merge: false
  }, options, filepath);

  options.base = path.resolve(options.base, ".");
  options.path = path.resolve(options.base, options.path);

  let manifest = {};

  const transform = function (file, enc, cb) {

    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
    }

    if (!file.destination || !file.revision) {
      return cb(null, file);
    }

    manifest[file.destination] = file.destination;

    cb();
  };

  const flush = function (cb) {

    if (Object.keys(manifest).length === 0) {
      cb();
      return;
    }

    const manifestFile = getManifestFile(options);

    if (options.merge && !manifestFile.isNull()) {

      let oldManifest;

      try {
        oldManifest = JSON.parse(manifestFile.contents.toString());
      } catch (err) {
        oldManifest = {};
      }

      manifest = Object.assign(oldManifest, manifest);
    }

    manifestFile.contents = new Buffer(JSON.stringify(sortKeys(manifest), null, "  "));

    /* eslint-disable */
    this.push(manifestFile);
    /* eslint-enable */

    cb();
  };

  return through.obj(transform, flush);
};

module.exports = revisionManifest;
