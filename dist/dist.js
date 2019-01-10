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
  let {
    name = options.name || npmShortName(pkg.name),
    input = options.input || path.resolve(path.join(path.dirname(path$$1), 'index.js')),
    output = options.output || path.join(path.dirname(path$$1), 'dist', `${name}.js`),
    cjs = options.cjs || pkg.main,
    iife = options.iife || pkg.iife,
    esm = options.esm || pkg.module || options.esm === '',
    inline
    // babel
  } = options;

  // Determine which dependencies should be external (Node.js core modules
  // should always be external).
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
    const inlineDependencies = inline ? inline.split(',') : dependencies;
    external = external.filter(p => inlineDependencies.indexOf(p) === -1);
  }

  // Determine which Rollup plugins should be used.
  const plugins = [
    // Allows dependencies to be bundled:
    ...(inline !== undefined ? [nodeResolvePlugin()] : []),
    // Allows CommonJS dependencies to be imported:
    cjsPlugin(),
    // Allows JSON to be imported:
    jsonPlugin()
  ];

  // Create the Rollup bundler instance.
  const bundler = await rollup.rollup({ input, external, plugins });

  // Generate the CommonJS bundle.
  let cjsBundle;
  if (cjs) {
    cjsBundle = await bundler.generate({ format: 'cjs' });
  }

  // Generate the Immediately Invoked Function Expression (IIFE) bundle.
  let iifeBundle;
  if (iife) {
    iifeBundle = await bundler.generate({ format: 'iife', name });
  }

  // Generate the EcmaScript Module bundle.
  let esmBundle;
  if (esm) {
    esmBundle = await bundler.generate({ format: 'esm' });
  }

  // Determine the output file paths.
  const cjsPath = path.extname(output) ? output : path.join(output, `${name}.js`);
  const dir = path.dirname(cjsPath);
  const iifePath = typeof iife === 'string' && path.extname(iife)
    ? path.resolve(iife)
    : path.join(dir, `${name}.iife.js`);
  const esmPath = typeof esm === 'string' && path.extname(esm)
    ? path.resolve(esm)
    : path.join(dir, `${name}.m.js`);

  // Return an object with the properties that use the file path as the key and
  // the source code as the value.
  return {
    ...(cjs ? { [cjsPath]: cjsBundle.output[0].code } : {}),
    ...(iife ? { [iifePath]: iifeBundle.output[0].code } : {}),
    ...(esm ? { [esmPath]: esmBundle.output[0].code } : {})
  }
}

module.exports = dist;
