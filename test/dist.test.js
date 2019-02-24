import { join } from 'path'
import test from 'ava'
import dist from '..'

const output = '/fakePath'

test('export default literal converted to module.exports', async t => {
  const name = 'exportDefaultLiteral'
  const input = join(__dirname, `fixtures/${name}.js`)
  const cjs = join(output, `${name}.js`)
  t.snapshot(await dist({ name, input, output, cjs, browser: true }))
})

test('export default function converted to module.exports', async t => {
  const input = join(__dirname, 'fixtures/exportDefaultFunction.js')
  const cjs = join(output, 'some-function.js')
  t.snapshot(await dist({ input, output, cjs }))
})

test('export default new expression converted to module.exports', async t => {
  const input = join(__dirname, 'fixtures/exportDefaultNewExpression.js')
  t.snapshot(await dist({ input, output, cjs: true }))
})

test('all imports get bundled with module into dist files', async t => {
  const name = 'exportDefaultFunctionWithImports'
  const input = join(__dirname, `fixtures/${name}.js`)
  const cjs = join(output, `${name}.js`)
  t.snapshot(await dist({ name, input, output, cjs, esm: true, inline: '' }))
})

test('specified import gets bundled with module into dist file', async t => {
  const input = join(__dirname, 'fixtures/exportObjectWithImports.js')
  const cjs = join(output, 'exportObjectWithImports.js')
  const inline = '@ianwalter/npm-short-name'
  t.snapshot(await dist({ input, output, cjs, inline, babel: true }))
})

test('hashbang is preserved', async t => {
  const input = join(__dirname, 'fixtures/cli.js')
  const cjs = join(output, 'cli.js')
  t.snapshot(await dist({ input, output, cjs }))
})
