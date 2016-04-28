"use strict";

const path = require("path");
const assert = require("assert");
const nunjucks = require("nunjucks");
const prepareConfig = require("./utils/prepare-config");
const loadCustomTags = require("./utils/load-custom-tags");

const stencil = require("./core");
const gulp = require("./gulp")(stencil);

module.exports.stencil = stencil;

module.exports.gulp = gulp;

module.exports.loadEnv = function (options) {

  assert(
    options && options.config && options.config.base,
    "`base` is required"
  );

  // Prepare the config by setting defaults and resolving paths
  const config = prepareConfig(options.config);

  // Initialize Stencil core
  stencil.init({
    config,
    environment: process.env.NODE_ENV || options.environment
  });

  // Plugin load order allows npm modules to override internal
  stencil.plugins.requirePluginFiles(path.join(__dirname, "plugins"));
  stencil.plugins.requirePluginModules(config.plugins);
  stencil.plugins.requirePluginFiles(config.plugins_dir);

  // Register hooks once plugins are resolved
  stencil.hooks.registerAll(stencil.plugins.getPlugins());

  // Set up the Nunjucks env
  const loader = new nunjucks.FileSystemLoader(config.templates_dir);
  const env = new nunjucks.Environment(loader, { autoescape: options.autoescape || false });

  env.addGlobal("stencil", stencil);
  env.addGlobal("site", stencil.site);

  env.resetCache = function () {
    loader.cache = {};
  };

  loadCustomTags(__dirname, env);
  loadCustomTags(config.templates_dir, env);

  // Initialize the site
  stencil.site.init({ config });

  return env;
};
