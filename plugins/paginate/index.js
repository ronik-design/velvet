"use strict";

const Paginator = require("./lib/paginator");
const Hooks = require("./lib/hooks");

module.exports = function (options) {

  const paginator = new Paginator({
    config: options.config,
    site: options.stencil.site,
    Page: options.stencil.Page
  });

  const hooks = new Hooks({ paginator });

  return { hooks };
};
