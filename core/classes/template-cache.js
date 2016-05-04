'use strict';

const STORE = Symbol.for('store');

class TemplateCache {

  constructor() {
    this[STORE] = {};
  }

  get(filepath, hash) {
    if (!this[STORE][filepath]) {
      return null;
    }

    const template = this[STORE][filepath];

    if (hash && template.hash === hash || !hash) {
      return template.tmpl;
    }
  }

  set(filepath, tmpl, hash) {
    const template = {tmpl, hash};

    this[STORE][filepath] = template;

    return this.get(filepath);
  }

  del(filepath) {
    delete this[STORE][filepath];
  }
}

module.exports = TemplateCache;
