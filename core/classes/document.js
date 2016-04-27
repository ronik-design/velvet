"use strict";

const path = require("path");
const applyToDefaults = require("hoek").applyToDefaults;
const slug = require("slug");
const buildPermalink = require("../../utils/build-permalink");
const fileType = require("../../utils/file-type");
const getDefaults = require("../../utils/get-defaults");

const stencil = require("../stencil");

const TOKENS = Symbol.for("tokens");
const TYPE = Symbol.for("type");
const VARIANTS = Symbol.for("variants");
const DEFAULTS = Symbol.for("defaults");

class Document {

  constructor(options) {

    // Type
    this[TYPE] = options.type || "documents";

    // Data
    const data = applyToDefaults(options.defaults || {}, options.data || {});

    const pathParts = path.parse(options.path);

    // Data store
    this.data = Object.assign(data, {
      title: data.title || pathParts.name,
      path: options.path,
      filepath: options.filepath,
      collection: options.collection,
      raw_content: options.content
    });

    // Permalink, has to happen after
    this.data.permalink = data.permalink ||
      this.defaultValues.permalink ||
      stencil.config.permalink;

    // Permalink tokens
    this[TOKENS] = {
      ":collection": options.collection,
      ":output_ext": ".html",
      ":basename": pathParts.name,
      ":dirname": pathParts.dir,
      ":baseurl": stencil.config.baseurl,
      ":categories": this.categories ? this.categories.join("/") : null,
      ":title": this.data.slug || pathParts.name,
      ":slug": this.data.slug || slug(pathParts.name)
    };
  }

  triggerHooks(hookType) {
    const args = [...arguments].slice(1);
    return stencil.hooks.trigger(this[TYPE], hookType, this, ...args);
  }

  getUrl(tokens, permalink) {
    permalink = permalink || this.data.permalink;
    return buildPermalink(tokens, { pattern: permalink, type: this.type });
  }

  addVariant(instance) {
    this[VARIANTS] = this[VARIANTS] || [];
    this[VARIANTS].push(instance);
    return instance;
  }

  extend(data) {
    for (const prop in data) {
      if (this[prop] === undefined) {
        this[prop] = data[prop];
      }
    }
  }

  get defaultValues() {
    this[DEFAULTS] = this[DEFAULTS] || getDefaults(stencil.config.defaults, this) || {};
    return this[DEFAULTS].values || {};
  }

  get defaultProcess() {
    this[DEFAULTS] = this[DEFAULTS] || getDefaults(stencil.config.defaults, this) || {};
    return this[DEFAULTS].process || {};
  }

  get placeInLayout() {
    return this.layout !== undefined && this.layout !== null;
  }

  get renderWithNunjucks() {
    return true;
  }

  get assetFile() {
    return false;
  }

  get output() {
    return !(this.data.hasOwnProperty("output") && this.data.output === false);
  }

  get filepath() {
    return this.data.filepath;
  }

  get path() {
    return this.data.path;
  }

  get categories() {

    const pathParts = this.path.split("/");

    if (pathParts.length > 1) {
      return pathParts.slice(0, pathParts.length - 1);
    }
  }

  get url() {
    return this.getUrl(this[TOKENS]);
  }

  get destination() {

    let destination = this.url;

    if (this.url !== "index.html") {
      destination = destination.replace(/\/$/, "/index.html");
    }

    if (stencil.config.baseurl) {
      destination = destination.replace(stencil.config.baseurl, "");
    }

    return destination.replace(/^\/+/, "").replace(/([?|#].+)$/, "");
  }

  get id() {
    return this.url.replace(/\/$/, "");
  }

  get type() {
    return this[TYPE];
  }

  get collection() {
    return this.data.collection;
  }

  get title() {
    return this.data.title;
  }

  get raw_content() {
    return this.data.raw_content;
  }

  get content() {

    if (this.data.content) {
      return this.data.content;
    }

    let content = this.data.raw_content;

    if (fileType.isMarkdown(this.path)) {
      content = stencil.converter.markdown(content);
    }

    this.data.content = content;

    return this.data.content;
  }

  get layout() {
    return this.data.hasOwnProperty("layout") ? this.data.layout : this.defaultValues.layout;
  }

  get published() {
    return !(this.data.hasOwnProperty("published") && this.data.published === false);
  }

  get variants() {
    return this[VARIANTS];
  }
}

module.exports = Document;
