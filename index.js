import { dirname, join, resolve, extname } from 'path'
import readPkgUp from 'read-pkg-up'
import { rollup } from 'rollup'
import cjsPlugin from 'rollup-plugin-commonjs'
import nodeResolvePlugin from 'rollup-plugin-node-resolve'
import jsonPlugin from 'rollup-plugin-json'
import npmShortName from '@ianwalter/npm-short-name'
import { transformAsync } from '@babel/core'
import promiseComplete from '@ianwalter/promise-complete'

const resolveFalse = Promise.resolve(false)
const byIsError = r => r instanceof Error

export default async function dist (options) {
  // Read modules package.json.
  const { pkg, path } = await readPkgUp()

  // Deconstruct options and set defaults if necessary.
  let {
    name = options.name || npmShortName(pkg.name),
    input = options.input || resolve(join(dirname(path), 'index.js')),
    output = options.output || join(dirname(path), 'dist'),
    cjs = options.cjs !== undefined ? options.cjs : pkg.main,
    iife = options.iife !== undefined ? options.iife : pkg.iife,
    esm = options.esm !== undefined ? options.esm : pkg.module,
    inline
  } = options

  cjs = cjs || cjs === ''
  iife = iife || iife === ''
  esm = esm || esm === ''
  inline = inline || inline === ''

  // Determine which dependencies should be external (Node.js core modules
  // should always be external).
  const dependencies = Object.keys(pkg.dependencies || {})
  let inlineDependencies = []
  if (inline) {
    inlineDependencies = inline === true ? dependencies : inline.split(',')
  }
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
    ...dependencies.filter(d => inlineDependencies.indexOf(d) === -1)
  ]

  // Determine which Rollup plugins should be used.
  const plugins = [
    // Allows dependencies to be bundled:
    ...(inlineDependencies.length ? [nodeResolvePlugin()] : []),
    // Allows CommonJS dependencies to be imported:
    cjsPlugin(),
    // Allows JSON to be imported:
    jsonPlugin()
  ]

  // Create the Rollup bundler instance(s).
  const bundler = await rollup({ input, external, plugins })
  let iifeBundler
  if (iife) {
    iifeBundler = await rollup({
      input,
      external,
      plugins,
      output: {
        globals: inlineDependencies.map(d => ({ [d]: npmShortName(d) }))
      }
    })
  }

  // Generate the CommonJS bundle.
  let cjsBundle
  if (cjs) {
    cjsBundle = await bundler.generate({ format: 'cjs' })
  }

  // Generate the Immediately Invoked Function Expression (IIFE) bundle.
  let iifeBundle
  if (iife) {
    iifeBundle = await iifeBundler.generate({ format: 'iife', name })
  }

  // Generate the EcmaScript Module bundle.
  let esmBundle
  if (esm) {
    esmBundle = await bundler.generate({ format: 'esm' })
  }

  let cjsCode = cjs ? cjsBundle.output[0].code : undefined
  let iifeCode = iife ? iifeBundle.output[0].code : undefined
  let esmCode = esm ? esmBundle.output[0].code : undefined
  if (options.babel) {
    // console.log(loadPartialConfig({ config: pkg.babel }))

    // Transform necessary dist files using babel in parallel and don't stop
    // other transformations if there is an error.
    const result = await promiseComplete({
      cjs: cjs ? transformAsync(cjsCode) : resolveFalse,
      iife: iife ? transformAsync(iifeCode) : resolveFalse,
      esm: esm ? transformAsync(esmCode) : resolveFalse
    })

    // Log any errors returned during the transformation process.
    Object.values(result).filter(byIsError).forEach(e => console.error(e))

    // Assign the transformed code if it was returned instead of an error.
    cjsCode = result.cjs instanceof Error ? undefined : result.cjs.code
    iifeCode = result.iife instanceof Error ? undefined : result.iife.code
    esmCode = result.esm instanceof Error ? undefined : result.esm.code
  }

  // Determine the output file paths.
  const dir = extname(output) ? dirname(output) : output
  const cjsPath = typeof cjs === 'string' && extname(cjs)
    ? resolve(cjs)
    : join(dir, `${name}.js`)
  const iifePath = typeof iife === 'string' && extname(iife)
    ? resolve(iife)
    : join(dir, `${name}.iife.js`)
  const esmPath = typeof esm === 'string' && extname(esm)
    ? resolve(esm)
    : join(dir, `${name}.m.js`)

  // Return an object with the properties that use the file path as the key and
  // the source code as the value.
  return {
    ...(cjs ? { cjs: [cjsPath, cjsCode] } : {}),
    ...(iife ? { iife: [iifePath, iifeCode] } : {}),
    ...(esm ? { esm: [esmPath, esmCode] } : {})
  }
}
