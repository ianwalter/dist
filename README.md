# @ianwalter/dist
> Simplify the generation of distribution files for your JavaScript library

[![npm page][npmImage]][npmUrl]

## About

`dist` is basically a wrapper around [Rollup][rollupUrl] for the specific use
cases discussed below. It was inspired by [microbundle][microbundleUrl] but
serves different, more-specific use cases.

## Features

* Write your library as an ES Module but still allow it to be require'd in
  Node.js
* Generate a separate distribution file that wraps your library and it's
  dependencies in an IIFE to make it easy to test your module in a real browser
  (e.g. using [Puppeteer][puppeteerUrl])
* Inline your library's dependencies to create a single distribution file that
  should significantly improve startup time (I haven't tested this yet).
* Use the babel option to transpile your code based on your library's
  [Babel][babelUrl] configuration

## Options

* `--name, -n`    Name to use for files and global variable (defaults to name in
                  package.json)
* `--input, -i`   Filename of source/entry file (defaults to {cwd}/index.js)
* `--output, -o`  Output filename or directory path (defaults to ./dist)
* `--cjs, -c`     Path for / whether to create a CommonJS dist file (defaults to
                  false or main in package.json)
* `--iife, -f`    Path for / whether to create a IIFE dist file (defaults to
                  false or iife in package.json)
* `--esm, -e`     Path for / whether to create a ESM dist file (defaults to
                  false or module in package.json)
* `--browser, -b` Path for / whether to create a browser-specific (ESM)
                  dist file (defaults to false or browser in package.json)
* `--inline, -l`  Inline/bundle imported modules (defaults to false)
* `--babel`       Transpile output with Babel (defaults to false)
* `--plugins, -p` Specify a path for a Rollup plugins file to include

## License

Apache 2.0 with Commons Clause - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://iankwalter.com)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/dist.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/dist
[rollupUrl]: https://rollupjs.org/
[microbundleUrl]: https://github.com/developit/microbundle
[puppeteerUrl]: https://pptr.dev/
[babelUrl]: https://babeljs.io/
[licenseUrl]: https://github.com/ianwalter/dist/blob/master/LICENSE

