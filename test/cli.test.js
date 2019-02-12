import { readFileSync } from 'fs'
import test from 'ava'
import execaHelper from '@ianwalter/execa-helper'

const withCli = execaHelper('./cli.js')
const withCnt = execaHelper('./cli.js', false)

test('cjs file not generated when --no-cjs passed', withCli, async (t, cli) => {
  const input = 'test/fixtures/exportDefaultFunction.js'
  const esm = 'tmp/one.js'
  const { stdout } = await cli('-i', input, '--esm', esm, '--no-cjs')
  t.snapshot(stdout)
  t.snapshot(readFileSync(esm, 'utf8'))
})

test('dist file is transpiled when --babel passed', withCnt, async (t, cli) => {
  const input = 'test/fixtures/exportDefaultNewExpression.js'
  const cjs = 'tmp/two.js'
  const { stdout } = await cli('-i', input, '--cjs', cjs, '--babel')
  t.snapshot(stdout)
  t.snapshot(readFileSync(cjs, 'utf8'))
})

test('dist file generated using custom plugins', withCli, async (t, cli) => {
  const input = 'test/fixtures/exportObjectWithVueComponent.js'
  const cjs = 'tmp/three.js'
  const plugins = ['--plugins', 'test/helpers/vuePlugin.js']
  const { stdout } = await cli('-i', input, '--cjs', cjs, ...plugins)
  t.snapshot(stdout)
  t.snapshot(readFileSync(cjs, 'utf8'))
})
