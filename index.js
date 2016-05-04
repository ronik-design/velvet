'use strict';

const path = require('path');
const assert = require('assert');
const nunjucks = require('nunjucks');
const prepareConfig = require('./utils/prepare-config');
const loadCustomTags = require('./utils/load-custom-tags');
const loadPluginTags = require('./utils/load-plugin-tags');

const velvet = require('./core');
const gulp = require('./gulp')(velvet);

module.exports.velvet = velvet;

module.exports.gulp = gulp;

module.exports.loadEnv = function (options) {
  assert(
    options && options.config && options.config.base,
    '`base` is required'
  );

  // Prepare the config by setting defaults and resolving paths
  const config = prepareConfig(options.config);

  // Initialize Stencil core
  velvet.init({
    config,
    environment: process.env.NODE_ENV || options.environment
  });

  // Set up the Nunjucks env
  const loader = new nunjucks.FileSystemLoader(config.templates_dir);
  const env = new nunjucks.Environment(loader, {autoescape: options.autoescape || false});

  env.addGlobal('velvet', velvet);
  env.addGlobal('site', velvet.site);
  env.resetCache = () => {
    loader.cache = {};
    return;
  };

  // Plugin load order allows npm modules to override internal
  velvet.plugins.requirePluginFiles(path.join(__dirname, 'plugins'), env);
  velvet.plugins.requirePluginModules(config.plugins, env);
  velvet.plugins.requirePluginFiles(config.plugins_dir, env);

  // Register hooks once plugins are resolved
  velvet.hooks.registerAll(velvet.plugins.getPlugins());

  // Load template tags
  loadCustomTags(__dirname, env);
  loadPluginTags(velvet.plugins.getPlugins(), env);
  loadCustomTags(config.templates_dir, env);

  // Initialize the site
  velvet.site.init({config});

  return env;
};
