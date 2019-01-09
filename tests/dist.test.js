import { join } from 'path'
import test from 'ava'
import { oneLine } from 'common-tags'
import dist from '..'

// TODO:
// test(
//   `
//     dist converts an export default literal declaration to a module.exports
//     assignment
//   `,
//   t => {
//     const path = join(__dirname, 'fixtures/exportDefaultLiteral.js')
//     t.snapshot(dist(readFileSync(path, 'utf8')))
//   }
// )

test(
  oneLine`
    dist converts an export default function declaration to a module.exports
    assignment
  `,
  async t => {
    const name = 'exportDefaultFunction'
    const input = join(__dirname, `fixtures/${name}.js`)
    t.snapshot(await dist({ name, input, output: '/fakePath', browser: true }))
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
    t.snapshot(await dist({ name, input, output: '/fakePath' }))
  }
)
