'use strict';

const path = require('path');
const fs = require('fs');
const md5File = require('md5-file');
const mime = require('mime');
const minimatch = require('minimatch');
const clone = require('hoek').clone;
const buildPermalink = require('../../utils/build-permalink');
const getDefaults = require('../../utils/get-defaults');

const velvet = require('../velvet');

const TOKENS = Symbol.for('tokens');
const TYPE = Symbol.for('type');
const DEFAULTS = Symbol.for('defaults');

class File {

  constructor(options) {
    // Type
    this[TYPE] = options.type || 'files';

    // Data
    const data = clone(options.data || {});

    // Data store
    this.data = Object.assign(data, {
      type: options.type || 'files',
      output: options.hasOwnProperty('output') ? options.output : true,
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
      ':hash': this.hash,
      ':output_ext': pathParts.ext,
      ':extname': pathParts.ext,
      ':basename': pathParts.name,
      ':dirname': pathParts.dir,
      ':baseurl': velvet.config.baseurl
    };
  }

  getUrl(tokens, options) {
    options = options || {};

    const opts = {
      pattern: options.pattern || this.data.permalink,
      revision: options.revision === undefined ? this.revision : options.revision,
      type: this.type
    };

    return buildPermalink(tokens, opts);
  }

  get output() {
    return this.data.output;
  }

  set output(value) {
    this.data.output = value;
  }

  get defaultValues() {
    this[DEFAULTS] = this[DEFAULTS] || getDefaults(velvet.config.defaults, this) || {};
    return this[DEFAULTS].values || {};
  }

  get defaultProcess() {
    this[DEFAULTS] = this[DEFAULTS] || getDefaults(velvet.config.defaults, this) || {};
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

    if (velvet.config.baseurl) {
      destination = destination.replace(velvet.config.baseurl, '');
    }

    return destination.replace(/^\/+/, '').replace(/([?|#].+)$/, '');
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

  get revision() {
    // Have to be in the right environment
    const revisionEnvs = velvet.getConfig(`${this.type}.revision.envs`) || [];
    if (!revisionEnvs.length || revisionEnvs.indexOf(velvet.environment) === -1) {
      return false;
    }

    // If there is a path scope, a path needs to match
    const revisionPaths = velvet.getConfig(`${this.type}.revision.paths`) || [];
    if (revisionPaths.length) {
      for (const revPath of revisionPaths) {
        if (minimatch(this.path, revPath)) {
          return true;
        }
      }
      return false;
    }

    // Had a matching environment, and no path-based scope
    return true;
  }
}

module.exports = File;
