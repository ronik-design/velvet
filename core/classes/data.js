'use strict';

const TYPE = Symbol.for('type');

class Data {

  constructor(options) {
    // File details
    this.filepath = options.filepath;

    // Type
    this[TYPE] = 'data';

    // Data
    Object.assign(this, options.data);
  }
}

module.exports = Data;
