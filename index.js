import { dirname, join, resolve, extname } from 'path'
import readPkgUp from 'read-pkg-up'
import { rollup } from 'rollup'
import cjsPlugin from 'rollup-plugin-commonjs'
import nodeResolvePlugin from 'rollup-plugin-node-resolve'
import jsonPlugin from 'rollup-plugin-json'
import npmShortName from '@ianwalter/npm-short-name'

export default async function dist (options) {
  // Read modules package.json.
  const { pkg, path } = await readPkgUp()

  // Deconstruct options and set defaults if necessary.
  let {
    name = options.name || npmShortName(pkg.name),
    input = options.input || resolve(join(dirname(path), 'index.js')),
    output = options.output || join(dirname(path), 'dist', `${name}.js`),
    cjs = options.cjs || pkg.main,
    browser = options.browser || pkg.browser,
    esm = options.esm || pkg.module || options.esm === '',
    inline = options.inline
  } = options

  // TODO: comment
  const dependencies = Object.keys(pkg.dependencies || {})
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
  ]
  if (inline !== undefined) {
    const inlineDependencies = inline ? inline.split(',') : dependencies
    external = external.filter(p => inlineDependencies.indexOf(p) === -1)
  }
  const plugins = [
    cjsPlugin(),
    ...(inline !== undefined ? [nodeResolvePlugin()] : []),
    jsonPlugin()
  ]
  const bundler = await rollup({ input, external, plugins })

  // TODO: comment
  let cjsBundle
  if (cjs) {
    cjsBundle = await bundler.generate({ format: 'cjs' })
  }

  // TODO: comment
  let browserBundle
  if (browser) {
    browserBundle = await bundler.generate({ format: 'iife', name })
  }

  // TODO: comment
  let esmBundle
  if (esm) {
    esmBundle = await bundler.generate({ format: 'esm' })
  }

  // TODO: comment
  const cjsPath = extname(output) ? output : join(output, `${name}.js`)
  const dir = dirname(cjsPath)
  const browserPath = typeof browser === 'string' && extname(browser)
    ? resolve(browser)
    : join(dir, `${name}.browser.js`)
  const esmPath = typeof esm === 'string' && extname(esm)
    ? resolve(esm)
    : join(dir, `${name}.m.js`)

  // TODO: comment
  return {
    ...(cjs ? { [cjsPath]: cjsBundle.output[0].code } : {}),
    ...(browser ? { [browserPath]: browserBundle.output[0].code } : {}),
    ...(esm ? { [esmPath]: esmBundle.output[0].code } : {})
  }
}
