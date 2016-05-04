"use strict";

class Hooks {

  constructor(options) {

    this.sprites = new Map();
  }


  get site() {

    const paginator = this.paginator;

    return {
      postRead(site, cb) {

        Object.defineProperty(site, "sprites", {
          get: this.getPage(name)
        });

        site.sprites =

        const paginatePages = site.pages.filter((p) => p.paginate);
        for (const page of paginatePages) {
          if (page.data.paginate) {
            paginator.paginate(page);
          }
        }
        cb();
      }
    };
  }

}

module.exports = Hooks;
