/* eslint global-require:0 */

'use strict';

const path = require('path');
const glob = require('glob');

const loadCustomTags = function (dir, env) {
  const tags = glob.sync(path.join(dir, 'tags', '**/*.js'));

  if (tags && tags.length) {
    for (const tagPath of tags) {
      const tag = require(tagPath);
      if (tag.install) {
        tag.install(env);
      }
    }
  }
};

module.exports = loadCustomTags;
