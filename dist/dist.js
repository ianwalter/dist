'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = require('path');
var readPkgUp = _interopDefault(require('read-pkg-up'));
var rollup = require('rollup');
var cjsPlugin = _interopDefault(require('rollup-plugin-commonjs'));
var nodeResolvePlugin = _interopDefault(require('rollup-plugin-node-resolve'));
var jsonPlugin = _interopDefault(require('rollup-plugin-json'));
var npmShortName = _interopDefault(require('@ianwalter/npm-short-name'));

async function dist (options) {
  // Read modules package.json.
  const { pkg, path: path$$1 } = await readPkgUp();

  // Deconstruct options and set defaults if necessary.
  const sourceModule = pkg.module || 'index.js';
  let {
    name = options.name || npmShortName(pkg.name),
    input = options.input || path.resolve(path.join(path.dirname(path$$1), sourceModule)),
    output = options.output || path.join(path.dirname(path$$1), 'dist', `${name}.js`),
    cjs = options.cjs || pkg.main,
    browser = options.browser || pkg.browser,
    inline = options.inline
  } = options;

  // TODO: comment
  const dependencies = Object.keys(pkg.dependencies || {});
  let external = [
    'path',
    'fs',
    'crypto',
    'url',
    'stream',
    'module',
    'util',
    'assert',
    'constants',
    'events',
    ...dependencies
  ];
  if (inline !== undefined) {
    inline = inline.length ? inline.split(',') : dependencies;
    external = external.filter(p => !inline.includes(p));
  }
  const plugins = [
    cjsPlugin(),
    ...(inline !== undefined ? [nodeResolvePlugin()] : []),
    jsonPlugin()
  ];

  // TODO: comment
  let cjsBundle;
  if (cjs) {
    const bundler = await rollup.rollup({ input, external, plugins });
    cjsBundle = await bundler.generate({ format: 'cjs' });
  }

  // TODO: comment
  let browserBundle;
  if (browser) {
    const bundler = await rollup.rollup({ input, external, plugins });
    browserBundle = await bundler.generate({ format: 'iife', name });
  }

  // TODO: comment
  const cjsPath = path.extname(output) ? output : path.join(output, `${name}.js`);
  const dir = path.dirname(cjsPath);
  const browserPath = typeof browser === 'string' && path.extname(browser)
    ? path.resolve(browser)
    : path.join(dir, `${name}.browser.js`);

  // TODO: comment
  return {
    ...(cjs ? { [cjsPath]: cjsBundle.output[0].code } : {}),
    ...(browser ? { [browserPath]: browserBundle.output[0].code } : {})
  }
}

module.exports = dist;
