'use strict';

const MARKDOWN = Symbol.for('markdown');

const getMarkdownConverter = function (config) {
  if (!config.markdown) {
    return {render: str => str};
  }

  let converter;

  try {
    converter = require(config.markdown);
  } catch (e) {
    throw new Error(`
      Markdown converter "${config.markdown}" is not installed.
      Install it first with, e.g. "npm install ${config.markdown}"
    `);
  }

  const markdownOptions = config[config.markdown];

  if (markdownOptions instanceof Object) {
    converter = converter(markdownOptions.options);

    if (markdownOptions.plugins) {
      for (const plugin of markdownOptions.plugins) {
        try {
          converter = converter.use(require(plugin.name), plugin.options);
        } catch (e) {
          throw new Error(`
            Markdown plugin "${plugin.name}" is not installed.
            Install it first with, e.g. "npm install ${plugin.name}"
          `);
        }
      }
    }
  } else {
    converter = converter(markdownOptions);
  }

  return converter;
};

class Converter {

  constructor(options) {
    this[MARKDOWN] = getMarkdownConverter(options.config);
  }

  markdown(str) {
    return this[MARKDOWN].render(str);
  }
}

module.exports = Converter;
