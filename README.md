# @ianwalter/dist
> Create CommonJS and Browser distribution files for your ESM/MJS library

[![npm page][npmImage]][npmUrl]

## About

`dist` is basically a wrapper around [Rollup][rollupUrl] for the specific use
cases discussed below. It was inspired by [microbundle][microbundleUrl] but
serves different, more-specific use cases.

## Features

* Write your package as an ES Module but still allow it to be require'd in
  Node.js
* Generate a single browser distribution file that wraps your module and it's
  dependencies in an IIFE to make it easy to test your module in a real browser
  (e.g. using [Puppeteer][puppeteerUrl]) without a more complex bundler like
  Webpack
* Inline your package's dependencies to create a single distribution file that
  should significantly improve startup time (I haven't tested this yet).

## Options

* `--name, -n`    Name to use for files and global variable (defaults to name in
                  package.json)
* `--input, -i`   Filename of source module Filename of source module (defaults
                  to module in package.json)
* `--output, -o`  Output filename or directory path (defaults to ./dist)
* `--cjs, -c`     Path for / whether to create a CommonJS dist file (defaults to
                  true and ./dist/{name}.js)
* `--browser, -b` Path for / whether to create a browser dist file (defaults to
                  false or browser in package.json or ./dist/{name}.browser.js)
* `--inline, -l`  Inline/bundle imported modules (defaults to false)

## License

Apache 2.0 with Commons Clause - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://iankwalter.com)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/dist.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/dist
[rollupUrl]: https://rollupjs.org/
[microbundleUrl]: https://github.com/developit/microbundle
[puppeteerUrl]: https://pptr.dev/

