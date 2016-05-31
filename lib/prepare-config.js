'use strict';

const path = require('path');
const moment = require('moment-timezone');
const hoek = require('hoek');

const NOT_PRESENT = -1;

const DEFAULTS = {
  baseurl: '/',
  assets_path: 'assets',
  images_path: 'assets/images',
  styles_path: 'assets/styles',
  scripts_path: 'assets/scripts',
  encoding: 'utf-8',
  markdown: 'markdown-it',
  'markdown-it': 'commonmark',
  data_ext: 'yml,yaml',
  markdown_ext: 'markdown,mkdown,mkdn,mkd,md',
  html_ext: 'html,htm',
  scripts_ext: 'js,jsx',
  styles_ext: 'css,scss,sass',
  images_ext: 'png,webp,jpg,jpeg,bmp,gif,tiff',
  styles: {},
  scripts: {},
  images: {},
  plugins: [],
  show_drafts: null,
  unpublished: false,
  future: false
};

const BASE_DIRS = {
  'source': 'site',
  'destination': 'public',
  'build': 'build'
};

const SOURCE_DIRS = {
  'data_dir': '_data',
  'posts_dir': '_posts',
  'templates_dir': '_templates',
  'scripts_dir': '_scripts',
  'styles_dir': '_styles',
  'images_dir': '_images',
  'plugins_dir': '_plugins',
  'drafts_dir': '_drafts'
};

const resolveDirs = function (options) {
  const config = hoek.applyToDefaults(SOURCE_DIRS, options);

  const baseDirs = Object.keys(BASE_DIRS);

  for (const prop in config) {
    if (baseDirs.indexOf(prop) > NOT_PRESENT) {
      const dir = config[prop];
      if (!path.isAbsolute(dir)) {
        config[prop] = path.resolve(config.base, dir).replace(/\/+$/, '');
      }
    }
  }

  const sourceDirs = Object.keys(SOURCE_DIRS);

  for (const prop in config) {
    if (sourceDirs.indexOf(prop) > NOT_PRESENT) {
      const dir = config[prop];
      if (!path.isAbsolute(dir)) {
        config[prop] = path.resolve(config.source, dir).replace(/\/+$/, '');
      }
    }
  }

  return config;
};

const prepareConfig = function (options) {
  let config = hoek.applyToDefaults(DEFAULTS, options);

  if (config.baseurl.charAt(0) !== '/') {
    config.baseurl = `/${config.baseurl}`;
  }

  if (config.baseurl.substr(-1) !== '/') {
    config.baseurl += '/';
  }

  config = resolveDirs(config);

  config.timezone = config.timezone || moment.tz.guess();

  return config;
};

module.exports = prepareConfig;
