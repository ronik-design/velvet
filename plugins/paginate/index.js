"use strict";

const Paginator = require("./lib/paginator");
const Hooks = require("./lib/hooks");

module.exports = function (options) {

  const paginator = new Paginator({
    config: options.config,
    site: options.velvet.site,
    Page: options.velvet.Page
  });

  const hooks = new Hooks({ paginator });

  return { hooks };
};
