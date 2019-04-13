const { readFileSync } = require('fs')
const { test } = require('@ianwalter/bff')
const execa = require('execa')

test('cjs file not generated when --no-cjs passed', async ({ expect }) => {
  const input = 'test/fixtures/exportDefaultFunction.js'
  const esm = 'tmp/one.js'
  const args = ['-i', input, '--esm', esm, '--no-cjs']
  const { stdout } = await execa('./cli.js', args)
  expect(stdout).toMatchSnapshot()
  expect(readFileSync(esm, 'utf8')).toMatchSnapshot()
})

test('dist file is transpiled when --babel passed', async ({ expect }) => {
  const input = 'test/fixtures/exportDefaultNewExpression.js'
  const cjs = 'tmp/two.js'
  const args = ['-i', input, '--cjs', cjs, '--babel']
  const { stdout } = await execa('./cli.js', args)
  expect(stdout).toMatchSnapshot()
  expect(readFileSync(cjs, 'utf8')).toMatchSnapshot()
})

test('dist file generated using custom plugins', async ({ expect }) => {
  const input = 'test/fixtures/exportObjectWithVueComponent.js'
  const cjs = 'tmp/three.js'
  const plugins = ['--plugins', 'test/helpers/vuePlugin.js']
  const args = ['-i', input, '--cjs', cjs, ...plugins]
  const { stdout } = await execa('./cli.js', args)
  expect(stdout).toMatchSnapshot()
  expect(readFileSync(cjs, 'utf8')).toMatchSnapshot()
})
