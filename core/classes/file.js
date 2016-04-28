"use strict";

const path = require("path");
const fs = require("fs");
const md5File = require("md5-file");
const mime = require("mime");
const clone = require("hoek").clone;
const buildPermalink = require("../../utils/build-permalink");
const getDefaults = require("../../utils/get-defaults");

const stencil = require("../stencil");

const TOKENS = Symbol.for("tokens");
const TYPE = Symbol.for("type");
const DEFAULTS = Symbol.for("defaults");

class File {

  constructor(options) {

    // Type
    this[TYPE] = options.type || "files";

    // Data
    const data = clone(options.data || {});

    // Data store
    this.data = Object.assign(data, {
      output: options.hasOwnProperty("output") ? options.output : true,
      path: options.path,
      filepath: options.filepath,
      collection: options.collection,
      modified_time: null,
      created_time: null,
      hash: null
    });

    const pathParts = path.parse(options.path);

    // Permalink tokens
    this[TOKENS] = {
      ":extname": pathParts.ext,
      ":basename": pathParts.name,
      ":dirname": pathParts.dir,
      ":baseurl": stencil.config.baseurl
    };
  }

  getUrl(tokens, permalink) {
    permalink = permalink || this.data.permalink;
    return buildPermalink(tokens, { pattern: permalink, type: this[TYPE] });
  }

  get output() {
    return this.data.output;
  }

  set output(value) {
    this.data.output = value;
  }

  get defaultValues() {
    this[DEFAULTS] = this[DEFAULTS] || getDefaults(stencil.config.defaults, this) || {};
    return this[DEFAULTS].values || {};
  }

  get defaultProcess() {
    this[DEFAULTS] = this[DEFAULTS] || getDefaults(stencil.config.defaults, this) || {};
    return this[DEFAULTS].process || {};
  }

  get renderWithNunjucks() {
    return false;
  }

  get assetFile() {
    return true;
  }

  get url() {
    return this.getUrl(this[TOKENS]);
  }

  get type() {
    return this[TYPE];
  }

  get filepath() {
    return this.data.filepath;
  }

  get extname() {
    return this.data.extname;
  }

  get path() {
    return this.data.path;
  }

  get destination() {

    let destination = this.url;

    if (stencil.config.baseurl) {
      destination = destination.replace(stencil.config.baseurl, "");
    }

    return destination.replace(/^\/+/, "").replace(/([?|#].+)$/, "");
  }

  get mime_type() {
    return mime.lookup(this.path);
  }

  get modified_time() {

    if (this.data.modified_time) {
      return this.data.modified_time;
    }

    const stat = fs.statSync(this.filepath);

    this.data.modified_time = stat.mtime;
    this.data.created_time = stat.ctime;

    return this.data.modified_time;
  }

  get created_time() {

    if (this.data.created_time) {
      return this.data.created_time;
    }

    const stat = fs.statSync(this.filepath);

    this.data.modified_time = stat.mtime;
    this.data.created_time = stat.ctime;

    return this.data.created_time;
  }

  get hash() {

    if (this.data.hash) {
      return this.data.hash;
    }

    this.data.hash = md5File(this.filepath);

    return this.data.hash;
  }
}

module.exports = File;
