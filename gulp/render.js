"use strict";

const path = require("path");
const through = require("through2");
const nunjucks = require("nunjucks");
const File = require("vinyl");
const gulpUtil = require("gulp-util");
const PluginError = gulpUtil.PluginError;
const getHash = require("../utils/get-hash");
const relPath = require("../utils/rel-path");

const PLUGIN_NAME = "velvet-render";
const HASH_LENGTH = 12;

const errorHandler = function (error, file, cb) {

  let filepath = error.file === "stdin" ? file.path : error.file;
  let message = "";

  filepath = filepath ? filepath : file.path;
  const relativePath = relPath(process.cwd(), filepath);

  message += `${gulpUtil.colors.underline(relativePath)}\n`;
  message += error.message ? error.message : error;

  error.messageFormatted = message;
  error.messageOriginal = error.message;
  error.message = gulpUtil.colors.stripColor(message);

  error.relativePath = relativePath;

  /* eslint-disable */
  console.error(gulpUtil.colors.red(`[${PLUGIN_NAME}]`), error.messageFormatted);
  /* eslint-enable */

  return cb(new PluginError(PLUGIN_NAME, error));
};

const render = function (filepath, context, options) {

  const page = context.page;
  const env = options.env;
  const cacheEnabled = options.cacheEnabled;
  const cache = options.templateCache;

  const content = page.content;

  let contentHash;
  let template;
  let rendered;

  if (cacheEnabled) {

    contentHash = getHash(content, HASH_LENGTH);
    template = cache.get(filepath, contentHash);

    if (!template) {
      template = nunjucks.compile(content, env);
      cache.set(filepath, template, contentHash);
    }

  } else {
    template = nunjucks.compile(content, env);
  }

  rendered = template.render(context);

  if (page.placeInLayout) {
    const layout = env.getTemplate(`layouts/${page.layout}.html`, true);
    context.content = rendered;
    rendered = layout.render(context);
  }

  return rendered;
};

const renderVariant = (file, variant, options) => {

  let rendered;

  const context = { page: variant };

  return variant.triggerHooks("preRender", context)
    .then(() => {

      rendered = render(file.path, context, options);
      return variant.triggerHooks("postRender", rendered);

    })
    .then(() => {

      options.transform.push(new File({
        contents: new Buffer(rendered),
        path: path.join(file.base, variant.destination),
        base: file.base
      }));
    });
};


const gulpRender = function (velvet) {

  return function (options) {

    options = options || {};

    const env = options.env;
    const cacheEnabled = !options.noCache;
    const site = velvet.site;
    const templateCache = velvet.templateCache;

    const transform = function (file, enc, cb) {

      if (file.isNull()) {
        return cb(null, file);
      }

      if (file.isStream()) {
        return cb(new PluginError(PLUGIN_NAME, "Streaming not supported"));
      }

      const doc = site.getObject(file.path);

      if (!doc.output) {
        file = null;
        return cb(null, null);
      }

      if (!doc.renderWithNunjucks) {
        return cb(null, file);
      }

      let tasks = [];


      const opts = {
        env,
        cacheEnabled,
        templateCache,
        /* eslint-disable */
        transform: this
        /* eslint-enable */
      };


      if (doc.variants) {
        tasks = doc.variants.map((variant) => renderVariant(file, variant, opts));
      }

      tasks.push(renderVariant(file, doc, opts));

      Promise.all(tasks)
        .then(() => cb())
        .catch((err) => errorHandler(err, file, cb));
    };

    return through.obj(transform);
  };
};

module.exports = gulpRender;
