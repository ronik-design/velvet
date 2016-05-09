'use strict';

const assert = require('assert');
const nunjucks = require('nunjucks');
const velvetGulp = require('velvet-gulp');
const prepareConfig = require('./utils/prepare-config');
const loadCustomTags = require('./utils/load-custom-tags');
const loadPluginTags = require('./utils/load-plugin-tags');

const velvet = require('./core');

module.exports.velvet = velvet;

module.exports.gulp = velvetGulp(velvet);

module.exports.loadEnv = function (options) {
  assert(
    options && options.config && options.config.base,
    '`base` is required'
  );

  // Prepare the config by setting defaults and resolving paths
  const config = prepareConfig(options.config);

  // Set up the Nunjucks env
  const loader = new nunjucks.FileSystemLoader(config.templates_dir);
  const env = new nunjucks.Environment(loader, {autoescape: options.autoescape || false});

  // Initialize Stencil core
  velvet.init({
    config,
    environment: process.env.NODE_ENV || options.environment
  });

  // Add env to Velvet
  velvet.env = env;

  env.addGlobal('site', velvet.site);
  env.resetCache = () => {
    loader.cache = {};
    return;
  };

  // Plugin load order allows npm modules to override internal
  config.plugins = config.plugins.unshift('velvet-nunjucks');
  velvet.plugins.requirePluginModules(config.plugins);
  velvet.plugins.requirePluginFiles(config.plugins_dir);

  // Register hooks once plugins are resolved
  velvet.hooks.registerAll(velvet.plugins.getPlugins());

  // Load template tags
  loadPluginTags(velvet.plugins.getPlugins(), env);
  loadCustomTags(config.templates_dir, env);

  // Initialize the site
  velvet.site.init({config});

  return env;
};
