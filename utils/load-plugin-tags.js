'use strict';

const loadPluginTags = function (plugins, env) {
  for (const plugin of plugins) {
    if (plugin[1].tags && plugin[1].tags.length) {
      for (const tag of plugin[1].tags) {
        if (tag.install) {
          tag.install(env);
        }
      }
    }
  }
};

module.exports = loadPluginTags;
