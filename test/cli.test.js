import { readFileSync } from 'fs'
import test from 'ava'
import execa from 'execa'

const cli = './cli.js'

test(`cli doesn't generate cjs file when passed --no-cjs`, async t => {
  const input = 'test/fixtures/exportDefaultFunction.js'
  const esm = 'tmp/one.js'
  const { stdout } = await execa(cli, ['-i', input, '--esm', esm, '--no-cjs'])
  t.snapshot(stdout)
  t.snapshot(readFileSync(esm, 'utf8'))
})

test(`cli transpiles dist file when given babel flag`, async t => {
  const input = 'test/fixtures/exportDefaultNewExpression.js'
  const cjs = 'tmp/two.js'
  const { stdout } = await execa(cli, ['-i', input, '--cjs', cjs, '--babel'])
  t.snapshot(stdout)
  t.snapshot(readFileSync(cjs, 'utf8'))
})
