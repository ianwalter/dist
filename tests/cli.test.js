import test from 'ava'
import execa from 'execa'

const cli = './cli.js'

test(`cli doesn't generate cjs file when passed --no-cjs`, async t => {
  const input = 'tests/fixtures/exportDefaultFunction.js'
  const esm = 'tests/tmp/one.js'
  const { stdout } = await execa(cli, [input, '--esm', esm, '--no-cjs'])
  t.snapshot(stdout)
})

test(`cli transpiles dist file when given babel flag`, async t => {
  const input = 'tests/fixtures/exportDefaultNewExpression.js'
  const cjs = 'tests/tmp/two.js'
  const { stdout } = await execa(cli, [input, '--cjs', cjs, '--babel'])
  t.snapshot(stdout)
})
