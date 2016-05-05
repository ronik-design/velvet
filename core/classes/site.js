/* eslint no-unused-expressions:0 */

'use strict';

const path = require('path');
const moment = require('moment-timezone');
const glob = require('glob');
const hoek = require('hoek');

const fileType = require('../../utils/file-type');
const loadYaml = require('../../utils/load-yaml');
const loadWithFrontMatter = require('../../utils/load-with-front-matter');
const fileExists = require('../../utils/file-exists');
const relPath = require('../../utils/rel-path');

const velvet = require('../velvet');

const STORE = Symbol.for('store');

const PRIVATE = '**/_*/**';

const DEFAULTS = {
  data: Object,
  categories: Object,
  tags: Object,
  collections: Object,
  objectsByPath: Map,
  objectsByUrl: Map,
  images: Array,
  files: Array,
  scripts: Array,
  styles: Array
};

const COLLECTION_DEFAULTS = {
  docs: [],
  label: '',
  files: [],
  relative_directory: '',
  directory: '',
  output: false
};

class Site {

  constructor() {
    this[STORE] = {};
  }

  init(options) {
    this.config = options.config;

    velvet.hooks.trigger('site', 'afterInit', this);

    this.reset();
  }

  reset() {
    this[STORE].time = moment.tz(new Date(), this.config.timezone);

    for (const prop in DEFAULTS) {
      this[STORE][prop] = new DEFAULTS[prop]();
    }

    velvet.hooks.trigger('site', 'afterReset', this);

    this.read();
  }

  read() {
    this.pages;
    this.data;
    this.posts;
    this.categories;
    this.tags;
    this.images;
    this.files;
    this.scripts;
    this.styles;
    this.collections;

    velvet.hooks.trigger('site', 'postRead', this);
  }

  getOrSetObject(relpath, directory, options) {
    const map = this[STORE].objectsByPath;
    const filepath = path.join(directory, relpath);

    const Ctor = options.Ctor;

    if (!map.has(filepath)) {
      if (fileExists(filepath)) {
        const opts = {
          filepath,
          path: relpath,
          site: this,
          collection: options.collection,
          defaults: options.defaults
        };

        if (options.filedata) {
          Object.assign(opts, options.filedata, opts);
        }

        const object = new Ctor(opts);

        map.set(filepath, object);
      } else {
        map.set(filepath, null);
      }
    }

    return map.get(filepath);
  }

  deleteObject(filepath, directory) {
    if (directory) {
      filepath = path.join(directory, filepath);
    }

    return this[STORE].objectsByPath.delete(filepath, null);
  }

  getObject(filepath, directory) {
    if (directory) {
      filepath = path.join(directory, filepath);
    }

    return this[STORE].objectsByPath.get(filepath);
  }

  getPage(relpath, options) {
    options = options || {};

    const directory = options.directory || this.config.source;

    const filedata = loadWithFrontMatter(path.join(directory, relpath), this.config);

    if (!filedata.hasOwnProperty('data')) {
      return;
    }

    const opts = {
      Ctor: velvet.Page,
      collection: options.label,
      filedata
    };

    return this.getOrSetObject(relpath, directory, opts);
  }

  get pages() {
    const config = this.config;

    const defaults = hoek.applyToDefaults(COLLECTION_DEFAULTS, {
      label: 'pages',
      relative_directory: '.',
      directory: config.source,
      output: true
    });

    const collections = this[STORE].collections;

    collections.pages = collections.pages || defaults;

    if (collections.pages.docs.length) {
      return collections.pages.docs;
    }

    const source = this.config.source;
    const globPattern = '**/*';
    const globOptions = {ignore: PRIVATE, cwd: source};
    const files = glob.sync(globPattern, globOptions);

    for (const filepath of files) {
      if (fileType.isHtml(filepath) || fileType.isMarkdown(filepath)) {
        const obj = this.getPage(filepath, collections.pages);

        if (obj) {
          collections.pages.docs.push(obj);
        }
      }
    }

    return collections.pages.docs;
  }

  get time() {
    return this[STORE].time;
  }

  get data() {
    const dataObj = this[STORE].data;

    if (Object.keys(dataObj).length) {
      return dataObj;
    }

    const dataDir = this.config.data_dir;
    const globPattern = '**/*';
    const files = glob.sync(path.join(dataDir, globPattern));

    for (const filepath of files) {
      if (fileType.isData(filepath)) {
        const name = path.basename(filepath, path.extname(filepath));
        const rawData = loadYaml(filepath, this.config);
        const data = new velvet.Data(Object.assign({filepath}, {data: rawData}));
        dataObj[name] = data;
      }
    }

    return dataObj;
  }

  getPost(relpath, options) {
    options = options || {};

    const directory = options.directory || this.config.posts_dir;

    const filedata = loadWithFrontMatter(path.join(directory, relpath), this.config);

    const opts = {
      Ctor: velvet.Post,
      collection: options.label,
      filedata
    };

    return this.getOrSetObject(relpath, directory, opts);
  }

  get posts() {
    const config = this.config;

    const defaults = hoek.applyToDefaults(COLLECTION_DEFAULTS, {
      label: 'posts',
      relative_directory: relPath(config.source, config.posts_dir),
      directory: config.posts_dir,
      output: true
    });

    const collections = this[STORE].collections;

    collections.posts = collections.posts || defaults;

    const collection = collections.posts;

    if (collection.docs.length) {
      return collection.docs;
    }

    const globPattern = '**/*';
    const globOptions = {cwd: collection.directory};
    const files = glob.sync(globPattern, globOptions);

    for (const filepath of files) {
      if (fileType.isMarkdown(filepath)) {
        collection.docs.push(this.getPost(filepath, collection));
      }
    }

    collection.docs = collection.docs.sort((a, b) => a.date - b.date);

    for (const p of collection.docs.entries()) {
      p[1].previous = collection.docs[p[0] - 1];
      p[1].next = collection.docs[p[0] + 1];
    }

    return collection.docs.reverse();
  }

  get categories() {
    const categories = this[STORE].categories;

    if (Object.keys(categories).length) {
      return categories;
    }

    const collections = this[STORE].collections;

    if (!collections.posts.docs.length) {
      this.posts;
    }

    for (const post of collections.posts.docs) {
      if (post.categories) {
        for (const c of post.categories) {
          const name = c.toLowerCase();
          categories[name] = categories[name] || [];
          categories[name].push(post);
        }
      }
    }

    return categories;
  }

  get tags() {
    const tags = this[STORE].tags;

    if (Object.keys(tags).length) {
      return tags;
    }

    const collections = this[STORE].collections;

    if (!collections.posts.docs.length) {
      this.posts;
    }

    for (const post of collections.posts.docs) {
      if (post.tags) {
        for (const t of post.tags) {
          const name = t.toLowerCase();
          tags[name] = tags[name] || [];
          tags[name].push(post);
        }
      }
    }

    return tags;
  }

  getImage(relpath, options) {
    options = options || {};

    const directory = options.directory || this.config.images_dir;

    const opts = {
      Ctor: velvet.Image
    };

    return this.getOrSetObject(relpath, directory, opts);
  }

  addImage(data) {
    const objectsByPath = this[STORE].objectsByPath;
    const objectsByUrl = this[STORE].objectsByUrl;

    const image = new velvet.Image(data);

    if (!objectsByPath.has(image.filepath)) {
      objectsByPath.set(image.filepath, image);
    }

    if (!objectsByUrl.has(image.url)) {
      objectsByUrl.set(image.url, image);
    }

    return image;
  }

  get images() {
    const images = this[STORE].images;

    if (images.length) {
      return images;
    }

    const imagesDir = this.config.images_dir;
    const globPattern = '**/*';
    const globOptions = {cwd: imagesDir};
    const files = glob.sync(globPattern, globOptions);

    for (const filepath of files) {
      if (fileType.isImage(filepath)) {
        images.push(this.getImage(filepath));
      }
    }

    return images;
  }

  getFile(relpath, options) {
    options = options || {};

    const directory = options.directory || this.config.source;

    if (fileType.isHtml(relpath) && this.getObject(relpath, directory)) {
      // return early if this was already read as a page
      return;
    }

    const opts = {
      Ctor: velvet.File,
      collection: options.label
    };

    return this.getOrSetObject(relpath, directory, opts);
  }

  get files() {
    const filesStore = this[STORE].files;

    if (filesStore.length) {
      return filesStore;
    }

    const source = this.config.source;

    const globPattern = '**/*';
    const globOptions = {
      cwd: source,
      nodir: true,
      ignore: [PRIVATE]
    };

    const files = glob.sync(globPattern, globOptions);

    for (const filepath of files) {
      if (!fileType.isMarkdown(filepath)) {
        const file = this.getFile(filepath);
        if (file) {
          filesStore.push(file);
        }
      }
    }

    return filesStore;
  }

  getScript(relpath, options) {
    options = options || {};

    const directory = options.directory || this.config.scripts_dir;

    const opts = {
      Ctor: velvet.Script
    };

    return this.getOrSetObject(relpath, directory, opts);
  }

  get scripts() {
    const scripts = this[STORE].scripts;

    if (scripts.length) {
      return scripts;
    }

    const scriptsDir = this.config.scripts_dir;

    const globPattern = '**/*';
    const globOptions = {
      cwd: scriptsDir,
      nodir: true,
      ignore: [PRIVATE]
    };

    const files = glob.sync(globPattern, globOptions);

    for (const filepath of files) {
      if (fileType.isScript(filepath)) {
        scripts.push(this.getScript(filepath));
      }
    }

    return scripts;
  }

  getStyle(relpath, options) {
    options = options || {};

    const directory = options.directory || this.config.styles_dir;

    const opts = {
      Ctor: velvet.Style
    };

    return this.getOrSetObject(relpath, directory, opts);
  }

  get styles() {
    const styles = this[STORE].styles;

    if (styles.length) {
      return styles;
    }

    const stylesDir = this.config.styles_dir;

    const globPattern = '**/*';
    const globOptions = {
      cwd: stylesDir,
      nodir: true,
      ignore: [PRIVATE]
    };

    const files = glob.sync(globPattern, globOptions);

    for (const filepath of files) {
      if (fileType.isStyle(filepath)) {
        styles.push(this.getStyle(filepath));
      }
    }

    return styles;
  }

  getDocument(relpath, options) {
    options = options || {};

    const directory = options.directory || this.config.source;

    const filedata = loadWithFrontMatter(path.join(directory, relpath), this.config);

    const opts = {
      Ctor: velvet.Document,
      collection: options.label,
      defaults: options.defaults,
      filedata
    };

    return this.getOrSetObject(relpath, directory, opts);
  }

  getCollection(label, options) {
    options = options || {};

    const config = this.config;

    const directory = path.join(config.source, `_${label}`);

    const opts = {
      label,
      directory,
      relative_directory: relPath(config.source, directory)
    };

    if (options.output) {
      opts.output = true;
    }

    if (Object.keys(options).length) {
      opts.defaults = options;
    }

    const collection = hoek.applyToDefaults(COLLECTION_DEFAULTS, opts);

    const globPattern = '**/*';

    const globOptions = {
      cwd: collection.directory,
      nodir: true,
      ignore: [PRIVATE]
    };

    const files = glob.sync(globPattern, globOptions);

    for (const filepath of files) {
      if (fileType.isMarkdown(filepath) || fileType.isHtml(filepath)) {
        collection.docs.push(this.getDocument(filepath, collection));
      } else {
        collection.files.push(this.getFile(filepath, collection));
      }
    }

    return collection;
  }

  get collections() {
    const config = this.config;
    const collections = {};

    if (config.collections) {
      if (Array.isArray(config.collections)) {
        for (const label of config.collections) {
          collections[label] = this.getCollection(label);
        }
      } else {
        for (const label in config.collections) {
          collections[label] = this.getCollection(label, config.collections[label]);
        }
      }
    }

    for (const label in collections) {
      if (!this[label]) {
        this[label] = collections[label].docs;
      }
    }

    Object.assign(this[STORE].collections, collections);

    return this[STORE].collections;
  }
}

module.exports = Site;
