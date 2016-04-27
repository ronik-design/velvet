"use strict";

const hoek = require("hoek");
const stencil = require("../stencil");

class Page extends stencil.Document {

  constructor(options) {

    options.type = "pages";

    super(options);

    // Defaults
    const defaults = this.defaultValues;

    // Data store
    Object.assign(this.data, {
      permalink: this.data.permalink || defaults.permalink || stencil.config.permalink
    });

    // Apply defaults
    this.data = hoek.applyToDefaults(defaults, this.data);

    // Extend
    this.extend(this.data);

    // Trigger hook
    this.triggerHooks("postInit");
  }
}

module.exports = Page;
