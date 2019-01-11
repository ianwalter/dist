import test from 'ava'
import execa from 'execa'

const cli = './cli.js'

test(`cli doesn't generate cjs file when passed --no-cjs`, async t => {
  const input = 'tests/fixtures/exportDefaultFunction.js'
  const esm = 'tests/tmp/one.js'
  const { stdout } = await execa(cli, [input, '--esm', esm, '--no-cjs'])
  t.snapshot(stdout)
})
