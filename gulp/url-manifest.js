/* eslint no-invalid-this:0 */

"use strict";

const path = require("path");
const File = require("vinyl");
const vinylFile = require("vinyl-file");
const sortKeys = require("sort-keys");
const through = require("through2");
const relPath = require("../utils/rel-path");

const TOKENS = Symbol.for("tokens");

const getManifestFile = function (options) {

  let file;

  try {
    file = vinylFile.readSync(options.path, options);
  } catch (err) {
    file = new File(options);
  }

  return file;
};

const gulpManifest = function (filepath, options) {

  if (typeof filepath === "string") {
    filepath = { path: filepath };
  }

  options = Object.assign({
    path: ".velvet-manifest",
    merge: false
  }, options, filepath);

  options.base = path.resolve(options.base, ".");
  options.path = path.resolve(options.base, options.path);

  let manifest = {};

  const transform = function (file, enc, cb) {

    let oldUrl;
    let newUrl;

    if (file.oldUrl && file.newUrl) {

      oldUrl = file.oldUrl;
      newUrl = file.newUrl;

    } else if (file.path && file.velvetObj) {

      const relpath = relPath(file.base, file.path);
      const tokens = Object.assign({}, file.velvetObj[TOKENS]);
      tokens[":extname"] = path.extname(relpath);
      tokens[":basename"] = path.basename(relpath, tokens[":extname"]);
      tokens[":dirname"] = path.dirname(relpath);

      oldUrl = file.velvetVariant ? file.velvetVariant.url : file.velvetObj.url;
      newUrl = file.velvetObj.getUrl(tokens);
    }

    // ignore all non-mapped files
    if (!oldUrl || !newUrl || oldUrl === newUrl) {
      cb();
      return;
    }

    manifest[oldUrl] = newUrl;

    cb();
  };

  const flush = function (cb) {

    if (Object.keys(manifest).length === 0) {
      cb();
      return;
    }

    const manifestFile = getManifestFile(options);

    if (options.merge && !manifestFile.isNull()) {

      let oldManifest = {};

      try {
        oldManifest = JSON.parse(manifestFile.contents.toString());
      } catch (err) {
        oldManifest = {};
      }

      manifest = Object.assign(oldManifest, manifest);
    }

    manifestFile.contents = new Buffer(JSON.stringify(sortKeys(manifest), null, "  "));

    this.push(manifestFile);

    cb();
  };

  return through.obj(transform, flush);
};

module.exports = gulpManifest;
