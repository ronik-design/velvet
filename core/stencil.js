/* eslint global-require:0 */

"use strict";

class Stencil {

  init(options) {

    this.config = options.config;

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
}

module.exports = new Stencil();
