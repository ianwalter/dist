import test from 'ava'
import execa from 'execa'

test(`cli doesn't generate cjs file when passed --no-cjs`, async t => {
  const { stdout } = await execa('./cli.js', ['--no-cjs', '--iife'])
  t.snapshot(stdout)
})
