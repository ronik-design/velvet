'use strict';

const getDefaults = function (siteDefaults, options) {
  siteDefaults = siteDefaults || [];

  const path = options.path;
  const type = options.type;
  const collection = options.collection;

  for (const defaults of siteDefaults) {
    const scope = defaults.scope;

    if (!scope) {
      continue;
    }

    if (scope.type !== type) {
      continue;
    }

    if (scope.path && !path.startsWith(scope.path)) {
      continue;
    }

    if (collection && scope.collection && scope.collection !== collection) {
      continue;
    }

    return defaults;
  }
};

module.exports = getDefaults;
