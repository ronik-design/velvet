# Velvet

Velvet is a modular, fast, static-site generator that looks a lot like [Jekyll](https://jekyllrb.com)
and can be easily incorporated into Gulp-based workflows. Unlike Jekyll, it is
written in Node.js and is very very fast when used with Gulp.


## Usage

The best way to use Velvet is via the [slush](http://slushjs.github.io)
generator.

You can find that [here](https://github.com/ronik-design/slush-velvet).


## Details

This module bundles up several custom utilities that take a config object and
return a special [nunjucks](https://mozilla.github.io/nunjucks/) environment.
While the [slush generator](https://github.com/ronik-design/slush-velvet)
provides several, fairly comprehensive Gulp tasks to turn that into somethere,
there would be nothing preventing alternate uses with different build systems,
or completely different workflows.

Essentially, this module is providing a filesystem decorator, that gives you
access to a slew of functions and utilities in your nunjucks templates, the
goal of which was to replicate Jekyll functionality, along with some features
I found absolutely necessary. These include basic asset management, and an
awareness of file "flavors" like scripts, styles and images.


## Nunjucks globals created

* `site` - the core object. Contains all the data about your site, files and
  templates. Supports most of the patterns in use by Jekyll (so much so, I
  will point you to their docs until I've completed some).

* custom tags - Including helpers for images, scripts, styles and files, which
  interact with the site object to keep track of needed assets, and options
  for those assets, e.g. `{{ 'favicon.png' | image_url({resize: [50]}) }}`
  would print the resized image url into the template, and would mark the
  necessary information on the `site` object for Gulp to process this image
  during the build process.
