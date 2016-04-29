const render = require("./render");
const init = require("./init");
const destination = require("./destination");
const revisionManifest = require("./revision-manifest");

module.exports = function (velvet) {

  return {
    init: init(velvet),
    destination: destination(velvet),
    revisionManifest: revisionManifest,
    render: render(velvet)
  };
};
