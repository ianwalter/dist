'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = require('path');
var readPkgUp = _interopDefault(require('read-pkg-up'));
var rollup = require('rollup');
var cjsPlugin = _interopDefault(require('rollup-plugin-commonjs'));
var nodeResolvePlugin = _interopDefault(require('rollup-plugin-node-resolve'));
var jsonPlugin = _interopDefault(require('rollup-plugin-json'));
var npmShortName = _interopDefault(require('@ianwalter/npm-short-name'));
var core = require('@babel/core');
var promiseComplete = _interopDefault(require('@ianwalter/promise-complete'));

const resolveFalse = Promise.resolve(false);
const byIsError = r => r instanceof Error;

async function dist (options) {
  // Read modules package.json.
  const { pkg, path: path$$1 } = await readPkgUp();

  // Deconstruct options and set defaults if necessary.
  let {
    name = options.name || npmShortName(pkg.name),
    input = options.input || path.resolve(path.join(path.dirname(path$$1), 'index.js')),
    output = options.output || path.join(path.dirname(path$$1), 'dist'),
    cjs = options.cjs !== undefined ? options.cjs : pkg.main,
    iife = options.iife !== undefined ? options.iife : pkg.iife,
    esm = options.esm !== undefined ? options.esm : pkg.module,
    inline
  } = options;

  cjs = cjs || cjs === '';
  iife = iife || iife === '';
  esm = esm || esm === '';

  // Determine which dependencies should be external (Node.js core modules
  // should always be external).
  const dependencies = Object.keys(pkg.dependencies || {});
  let nodeExternal = [
    'path',
    'fs',
    'crypto',
    'url',
    'stream',
    'module',
    'util',
    'assert',
    'constants',
    'events'
  ];
  let external = [...nodeExternal, ...dependencies];
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

  // Create the Rollup bundler instance(s).
  const bundler = await rollup.rollup({ input, external, plugins });
  let iifeBundler;
  if (iife) {
    iifeBundler = await rollup.rollup({
      input,
      external: nodeExternal,
      plugins: [nodeResolvePlugin(), cjsPlugin(), jsonPlugin()],
      output: { globals: dependencies.map(d => ({ [d]: npmShortName(d) })) }
    });
  }

  // Generate the CommonJS bundle.
  let cjsBundle;
  if (cjs) {
    cjsBundle = await bundler.generate({ format: 'cjs' });
  }

  // Generate the Immediately Invoked Function Expression (IIFE) bundle.
  let iifeBundle;
  if (iife) {
    iifeBundle = await iifeBundler.generate({ format: 'iife', name });
  }

  // Generate the EcmaScript Module bundle.
  let esmBundle;
  if (esm) {
    esmBundle = await bundler.generate({ format: 'esm' });
  }

  let cjsCode = cjs ? cjsBundle.output[0].code : undefined;
  let iifeCode = iife ? iifeBundle.output[0].code : undefined;
  let esmCode = esm ? esmBundle.output[0].code : undefined;
  if (options.babel) {
    // console.log(loadPartialConfig({ config: pkg.babel }))

    // Transform necessary dist files using babel in parallel and don't stop
    // other transformations if there is an error.
    const result = await promiseComplete({
      cjs: cjs ? core.transformAsync(cjsCode) : resolveFalse,
      iife: iife ? core.transformAsync(iifeCode) : resolveFalse,
      esm: esm ? core.transformAsync(esmCode) : resolveFalse
    });

    // Log any errors returned during the transformation process.
    Object.values(result).filter(byIsError).forEach(e => console.error(e));

    // Assign the transformed code if it was returned instead of an error.
    cjsCode = result.cjs instanceof Error ? undefined : result.cjs.code;
    iifeCode = result.iife instanceof Error ? undefined : result.iife.code;
    esmCode = result.esm instanceof Error ? undefined : result.esm.code;
  }

  // Determine the output file paths.
  const dir = path.extname(output) ? path.dirname(output) : output;
  const cjsPath = typeof cjs === 'string' && path.extname(cjs)
    ? path.resolve(cjs)
    : path.join(dir, `${name}.js`);
  const iifePath = typeof iife === 'string' && path.extname(iife)
    ? path.resolve(iife)
    : path.join(dir, `${name}.iife.js`);
  const esmPath = typeof esm === 'string' && path.extname(esm)
    ? path.resolve(esm)
    : path.join(dir, `${name}.m.js`);

  // Return an object with the properties that use the file path as the key and
  // the source code as the value.
  return {
    ...(cjs ? { cjs: [cjsPath, cjsCode] } : {}),
    ...(iife ? { iife: [iifePath, iifeCode] } : {}),
    ...(esm ? { esm: [esmPath, esmCode] } : {})
  }
}

module.exports = dist;
