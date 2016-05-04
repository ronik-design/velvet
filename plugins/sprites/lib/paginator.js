'use strict';

const path = require('path');
const clone = require('hoek').clone;

const DEFAULTS = {
  'collection': 'posts',
  'per_page': 10,
  'limit': 5,
  'permalink': '/page-:num/',
  'title_suffix': ' - page :num',
  'page_num': 1
};

const capitalize = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const intersection = function (arr1, arr2) {
  return arr1.filter((x) => arr2.indexOf(x) >= 0);
};

class Paginator {

  constructor(options) {

    this.config = options.config;
    this.site = options.site;
    this.Page = options.Page;
  }

  paginate(page) {

    const defaults = Object.assign({}, DEFAULTS, this.config.pagination);

    if (page.data.paginate instanceof Object) {
      page.data.paginate = Object.assign(defaults, page.data.paginate);
    } else {
      page.data.paginate = defaults;
    }

    if (page.data.paginate.tag) {
      page.data.paginate.tags = [page.data.paginate.tag];
    }

    if (page.data.paginate.category) {
      page.data.paginate.categories = [page.data.paginate.category];
    }

    this.addPages(page);
  }

  addPages(page) {

    const config = page.data.paginate;

    let pages = Math.ceil(this.collection(page).length / config.per_page);

    if (config.limit) {
      pages = Math.min(pages, config.limit);
    }

    page.data.paginate.pages = pages;

    const clonedData = clone(page.data);

    const allPages = [page];
    const firstNewPage = 2;

    const opts = {
      path: page.path,
      filepath: page.filepath,
      content: page.raw_content
    };

    for (let pageNum = firstNewPage; pageNum <= pages; pageNum++) {
      opts.data = clonedData;
      Object.assign(opts.data, this.pageData(page, pageNum));
      const newPage = new this.Page(opts);
      page.addVariant(newPage);
      allPages.push(newPage);
    }

    for (const p of allPages.entries()) {

      const pageIndex = p[0];
      const pageEntry = p[1];

      const pageNum = pageIndex + 1;
      const pageUrl = pageEntry.url;

      const nextPage = allPages[pageIndex + 1];
      const prevPage = allPages[pageIndex - 1];

      if (nextPage) {
        nextPage.data.paginate.previous_page = pageNum;
        nextPage.data.paginate.previous_page_path = pageUrl;
      }

      if (prevPage) {
        prevPage.data.paginate.next_page = pageNum;
        prevPage.data.paginate.next_page_path = pageUrl;
      }
    }

    return allPages;
  }

  collection(page) {

    let collection;

    if (page.data.paginate.collection === 'posts') {
      collection = [].concat(this.site.posts);
    } else {
      collection = [].concat(this.site.collections[page.data.paginate.collection].docs);
    }

    const categories = page.data.paginate.categories;
    if (categories) {
      collection = collection.filter((p) => intersection(p.categories, categories).length);
    }

    const tags = page.data.paginate.tags;
    if (tags) {
      collection = collection.filter((p) => intersection(p.tags, tags).length);
    }

    return collection;
  }

  pageData(page, index) {
    return {
      paginate: this.paginateData(page, index),
      permalink: this.pagePermalink(page, index),
      title: this.pageTitle(page, index)
    };
  }

  pagePermalink(page, index) {

    const subdir = page.data.paginate.permalink.replace(/:num/g, index);
    const lastChar = -1;

    if (page.url.slice(lastChar) === '/') {
      return path.join(page.url, subdir);
    } else {
      const dir = path.dirname(page.url);
      const ext = path.extname(page.url);
      const base = path.basename(page.url, ext);
      const suffix = subdir.replace(/\//g, '');
      return path.join(dir, `${base}${suffix}${ext}`);
    }
  }

  paginateData(page, index) {
    const paginateData = Object.assign({}, page.data.paginate);
    paginateData.page_num = index;
    return paginateData;
  }

  pageTitle(page, index) {

    let title;

    if (page.title) {
      title = page.title;
    } else {
      title = capitalize(page.data.paginate.collection);
    }

    title += page.data.paginate.title_suffix.replace(/:num/g, index);

    return title;
  }

  pagePayload(context, page) {

    const config = page.data.paginate;

    const payload = {
      page: config.page_num,
      per_page: config.per_page,
      limit: config.limit,
      total_pages: config.pages,
      previous_page: config.previous_page,
      previous_page_path: config.previous_page_path,
      next_page: config.next_page,
      next_page_path: config.next_page_path
    };

    const collection = this.collection(page);

    payload[config.collection] = this.items(context, collection);
    payload[`total_${config.collection}`] = collection.length;

    return payload;
  }

  items(context, collection) {

    const config = context.page.data.paginate;

    const n = (config.page_num - 1) * config.per_page;
    const max = n + config.per_page;

    return collection.slice(n, max);
  }
}

module.exports = Paginator;
