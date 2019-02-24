import { join } from 'path'
import test from 'ava'
import { oneLine } from 'common-tags'
import dist from '..'

const output = '/fakePath'

test(
  `
    dist converts an export default literal declaration to a module.exports
    assignment
  `,
  async t => {
    const name = 'exportDefaultLiteral'
    const input = join(__dirname, `fixtures/${name}.js`)
    const cjs = join(output, `${name}.js`)
    const browser = join(output, `${name}.browser.js`)
    t.snapshot(await dist({ name, input, cjs, browser }))
  }
)

test(
  oneLine`
    dist converts an export default function declaration to a module.exports
    assignment
  `,
  async t => {
    const name = 'exportDefaultFunction'
    const input = join(__dirname, `fixtures/${name}.js`)
    const cjs = join(output, 'some-function.js')
    t.snapshot(await dist({ name, input, output, cjs }))
  }
)

test(
  oneLine`
    dist converts an export default new expresion declaration to a
    module.exports assignment
  `,
  async t => {
    const name = 'exportDefaultNewExpression'
    const input = join(__dirname, `fixtures/${name}.js`)
    t.snapshot(await dist({ name, input, output, cjs: true }))
  }
)

test('dist bundles imports with module into dist files', async t => {
  const name = 'exportDefaultFunctionWithImports'
  const input = join(__dirname, `fixtures/${name}.js`)
  const cjs = join(output, `${name}.js`)
  t.snapshot(await dist({ name, input, output, cjs, esm: true, inline: '' }))
})

test('specified import gets bundled with module into dist files', async t => {
  const name = 'exportObjectWithImports'
  const input = join(__dirname, `fixtures/${name}.js`)
  const cjs = join(output, `${name}.js`)
  const inline = '@ianwalter/npm-short-name'
  t.snapshot(await dist({ name, input, output, cjs, inline, babel: true }))
})

test('hashbang is preserved', async t => {
  const input = join(__dirname, 'fixtures/cli.js')
  const cjs = join(output, 'cli.js')
  t.snapshot(await dist({ input, output, cjs }))
})
