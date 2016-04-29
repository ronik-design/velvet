/* eslint global-require:0 */

"use strict";

const hoek = require("hoek");

class Velvet {

  init(options) {

    this.config = options.config;
    this.environment = options.environment || "development";

    this.site = this.autoload("./classes/site");
    this.hooks = this.autoload("./classes/hooks");
    this.plugins = this.autoload("./classes/plugins");
    this.templateCache = this.autoload("./classes/template-cache");
    this.converter = this.autoload("./classes/converter");

    this.Data = require("./classes/data");
    this.Document = require("./classes/document");
    this.Page = require("./classes/page");
    this.Post = require("./classes/post");
    this.File = require("./classes/file");
    this.Image = require("./classes/image");
    this.ImageVariant = require("./classes/image-variant");
    this.Script = require("./classes/script");
    this.Style = require("./classes/style");
  }

  autoload(filepath) {
    const Ctor = require(filepath);
    return new Ctor({ config: this.config });
  }

  getConfig(prop) {
    return hoek.reach(this.config, prop);
  }
}

module.exports = new Velvet();
