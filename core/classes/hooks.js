'use strict';

const async = require('async');
const clone = require('hoek').clone;
const reach = require('hoek').reach;
const REGISTRY = Symbol.for('registry');

const DEFAULTS = {
  'site': {
    'afterInit': [],
    'afterReset': [],
    'postRead': [],
    'preRender': [],
    'postRender': [],
    'postWrite': []
  },
  'pages': {
    'postInit': [],
    'preRender': [],
    'postRender': [],
    'postWrite': []
  },
  'posts': {
    'postInit': [],
    'preRender': [],
    'postRender': [],
    'postWrite': []
  },
  'documents': {
    'postInit': [],
    'preRender': [],
    'postRender': [],
    'postWrite': []
  },
  'files': {
    'postInit': [],
    'preRender': [],
    'postRender': [],
    'postWrite': []
  }
};

class Hooks {

  constructor() {
    this[REGISTRY] = clone(DEFAULTS);
  }

  register(module) {
    const registry = this[REGISTRY];
    const hooks = module.hooks;

    if (!hooks) {
      return;
    }

    for (const hookType of Object.keys(registry)) {
      if (module.hooks[hookType]) {
        for (const hookName of Object.keys(registry[hookType])) {
          if (module.hooks[hookType][hookName]) {
            const hookFn = hooks[hookType][hookName];
            registry[hookType][hookName] = registry[hookType][hookName] || [];
            registry[hookType][hookName].push(hookFn);
          }
        }
      }
    }
  }

  registerAll(modules) {
    for (const module of modules.values()) {
      this.register(module);
    }
  }

  trigger(hookType, hookName) {
    const registry = this[REGISTRY];
    const args = [...arguments].slice(2);
    const hook = reach(registry, `${hookType}.${hookName}`);

    if (hook && hook.length) {
      return new Promise((resolve, reject) => {
        async.applyEachSeries(registry[hookType][hookName], ...args, err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    }

    return Promise.resolve();
  }
}

module.exports = Hooks;
