'use strict';

const path = require('path');

const PAGES = 'pages';
const POSTS = 'posts';
const DOCUMENTS = 'documents';
const FILES = 'files';
const STYLES = 'styles';
const SCRIPTS = 'scripts';
const IMAGES = 'images';

const REPLACEMENTS = [
  ':collection',
  ':year',
  ':month',
  ':i_month',
  ':day',
  ':i_day',
  ':short_year',
  ':hour',
  ':minute',
  ':second',
  ':title',
  ':slug',
  ':categories',
  ':dirname',
  ':basename',
  ':urlpath',
  ':output_ext',
  ':extname',
  ':hash',
  ':filters_hash',
  ':filters'
];

/* eslint-disable */
const SEPARATORS = '\/|\\-|\.|?|#|_';
/* eslint-enable */

const buildPermalink = function (tokens, options) {
  tokens = Object.assign({}, tokens);
  options = Object.assign({}, options);

  const type = options.type;

  let permalink = options.pattern;

  if (type === PAGES) {
    permalink = permalink || 'date';

    if (permalink === 'pretty') {
      if (tokens[':dirname'] === '' &&
          tokens[':basename'] === 'index' ||
          tokens[':basename'] === 'error') {
        permalink = 'date';
      } else {
        permalink = '/:dirname/:basename/';
      }
    }

    if (permalink === 'date') {
      permalink = '/:dirname/:basename:output_ext';
    }

    if (tokens[':dirname'] === '' && tokens[':basename'] === 'index') {
      permalink = '/';
    }
  }

  if (type === DOCUMENTS) {
    permalink = permalink || 'date';

    if (permalink === 'pretty') {
      permalink = '/:collection/:dirname/:basename/';
    }

    if (permalink === 'date') {
      permalink = '/:collection/:dirname/:basename:output_ext';
    }
  }

  if (type === POSTS) {
    permalink = permalink || 'date';

    if (permalink === 'date') {
      permalink = '/:categories/:year/:month/:day/:title.html';
    }

    if (permalink === 'pretty') {
      permalink = '/:categories/:year/:month/:day/:title/';
    }

    if (permalink === 'ordinal') {
      permalink = '/:categories/:year/:i_day/:title.html';
    }

    if (permalink === 'none') {
      permalink = '/:categories/:title.html';
    }
  }

  if (type === FILES ||
      type === SCRIPTS ||
      type === STYLES ||
      type === IMAGES) {
    permalink = permalink || '/:urlpath/:dirname/:basename:output_ext';
  }

  // Perform token replacements
  for (const token of REPLACEMENTS) {
    const replacement = tokens[token] || '';

    // Token present, but no replacement
    if (permalink.search(token) >= 0 && !replacement) {
      // Clear token and valid separator
      const re = new RegExp(`[${SEPARATORS}]?${token}`, 'g');
      permalink = permalink.replace(re, '');
    } else {
      // Replace token
      permalink = permalink.replace(token, replacement);
    }
  }

  if (tokens[':hash'] && options.revision) {
    const ext = path.extname(permalink);
    const hash = tokens[':hash'];
    const re = new RegExp(`${ext}$`);
    permalink = permalink.replace(re, `.${hash}${ext}`);
  }

  // Add the baseurl
  return `${tokens[':baseurl']}${permalink.replace(/^\/+/, '')}`;
};

module.exports = buildPermalink;
