'use strict';

const assert = require('assert');
const nunjucks = require('nunjucks');
const velvet = require('velvet-core');

const prepareConfig = require('./lib/prepare-config');
const loadCustomTags = require('./lib/load-custom-tags');
const loadPluginTags = require('./lib/load-plugin-tags');

module.exports.velvet = velvet;

module.exports.loadEnv = function (options) {
  assert(
    options && options.config && options.config.base,
    '`base` is required'
  );

  // Prepare the config by setting defaults and resolving paths
  const config = prepareConfig(options.config);
  const environment = process.env.NODE_ENV || options.environment;

  // Initialize Stencil core
  velvet.init({config, environment});

  // Set up the Nunjucks env
  const loader = new nunjucks.FileSystemLoader(config.templates_dir);
  const env = new nunjucks.Environment(loader, {autoescape: options.autoescape || false});

  env.addGlobal('config', config)
    .addGlobal('environment', environment)
    .addGlobal('site', velvet.site);

  env.resetCache = () => {
    loader.cache = {};
    return env;
  };

  // Plugin load order allows npm modules to override internal
  config.plugins.unshift('velvet-nunjucks');
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
