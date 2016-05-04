'use strict';

class Hooks {

  constructor(options) {
    this.paginator = options.paginator;
  }

  get site() {
    const paginator = this.paginator;

    return {
      postRead(site, cb) {
        const paginatePages = site.pages.filter(p => p.paginate);
        for (const page of paginatePages) {
          if (page.data.paginate) {
            paginator.paginate(page);
          }
        }
        cb();
      }
    };
  }

  get pages() {
    const paginator = this.paginator;

    return {
      preRender(page, context, cb) {
        if (page.data.paginate) {
          context.paginator = paginator.pagePayload(context, page);
        }
        cb();
      }
    };
  }
}

module.exports = Hooks;
