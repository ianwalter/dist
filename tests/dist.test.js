import { readFileSync } from 'fs'
import { join } from 'path'
import test from 'ava'
import dist from '..'

test(
  `
    dist converts an export default literal declaration to a module.exports
    assignment
  `,
  t => {
    const path = join(__dirname, 'fixtures/exportDefaultLiteral.js')
    t.snapshot(dist(readFileSync(path, 'utf8')))
  }
)

test(
  `
    dist converts an export default function declaration to a module.exports
    assignment
  `,
  t => {
    const path = join(__dirname, 'fixtures/exportDefaultFunction.js')
    t.snapshot(dist(readFileSync(path, 'utf8')))
  }
)
