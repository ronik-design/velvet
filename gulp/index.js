const urlManifest = require("./url-manifest");
const urlMap = require("./url-map");
const render = require("./render");
const init = require("./init");

module.exports = function (stencil) {

  return {
    init: init(stencil),
    render: render(stencil),
    urlManifest,
    urlMap
  };
};
