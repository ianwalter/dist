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
    t.snapshot(await dist({ name, input, output }))
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
    t.snapshot(await dist({ name, input, output, iife: true }))
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
    t.snapshot(await dist({ name, input, output }))
  }
)

test('dist bundles imports with module into dist files', async t => {
  const name = 'exportDefaultFunctionWithImport'
  const input = join(__dirname, `fixtures/${name}.js`)
  const iife = join(output, 'b.js')
  t.snapshot(await dist({ name, input, output, iife, esm: true }))
})
