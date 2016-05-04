'use strict';

const hoek = require('hoek');
const velvet = require('../velvet');

class Page extends velvet.Document {

  constructor(options) {
    options.type = 'pages';

    super(options);

    // Defaults
    const defaults = this.defaultValues;

    // Data store
    Object.assign(this.data, {
      permalink: this.data.permalink || defaults.permalink || velvet.config.permalink
    });

    // Apply defaults
    this.data = hoek.applyToDefaults(defaults, this.data);

    // Extend
    this.extend(this.data);

    // Trigger hook
    this.triggerHooks('postInit');
  }
}

module.exports = Page;
