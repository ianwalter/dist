#!/usr/bin/env node

/**
 * This is just a little script that can be run to help understand how recast
 * parses/generates AST.
 */
const recast = require('recast')
const parser = require('recast/parsers/typescript')

const src = `
export default new SomeClass()
`
console.log(recast.parse(src, { parser }).program.body[0])
