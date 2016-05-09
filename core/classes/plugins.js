/* eslint global-require:0 */

'use strict';

const path = require('path');
const glob = require('glob');

const velvet = require('../velvet');

const REGISTRY = Symbol.for('registry');

class Plugins {

  constructor() {
    this[REGISTRY] = new Map();
  }

  requirePlugin(name, plugin) {
    const registry = this[REGISTRY];
    const pluginName = path.basename(name, path.extname(name));

    if (!plugin) {
      try {
        plugin = require(name)({config: velvet.config, velvet});
      } catch (e) {
        throw new Error(`
          There was a problem loading plugin "${name}".
          Maybe you need to install it first?
          e.g. "npm install ${name}"
        `);
      }
    }

    registry.set(pluginName, plugin);
  }

  requirePluginFiles(dirs) {
    let pluginDirs = [];

    if (Array.isArray(dirs)) {
      pluginDirs = pluginDirs.concat(dirs);
    } else {
      pluginDirs.push(dirs);
    }

    for (const pluginDir of pluginDirs) {
      const globOpts = {cwd: pluginDir, ignore: '*.!(js)'};
      const filepaths = glob.sync('*', globOpts);
      for (const filepath of filepaths) {
        this.requirePlugin(path.join(pluginDir, filepath));
      }
    }
  }

  requirePluginModules(modules) {
    for (const module of modules) {
      this.requirePlugin(module);
    }
  }

  getPlugins() {
    return this[REGISTRY];
  }
}

module.exports = Plugins;
