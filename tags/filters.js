'use strict';

const install = function (env) {
  env.addFilter('starts_with', (str, searchStr) => {
    return str.search(searchStr) === 0;
  });

  env.addFilter('ends_with', (str, searchStr) => {
    return str.search(searchStr) === str.length - searchStr.length;
  });
};

module.exports = {install};
