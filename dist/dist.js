const { dirname, join, resolve } = require('path')
const { readFileSync } = require('fs')
const readPkgUp = require('read-pkg-up')
const { types, parse, print } = require('recast')
const parser = require('recast/parsers/babel')
const clone = require('@ianwalter/clone')

function getShortName (pkg) {
  const parts = pkg.name.split('/')
  return parts.length ? parts[parts.length - 1] : null
}

const { namedTypes } = types
const {
  identifier,
  memberExpression,
  functionExpression,
  assignmentStatement,
  expressionStatement
} = types.builders
const modulePattern = identifier('module')
const windowPattern = identifier('window')
const exportsPattern =  identifier('exports')
const moduleExportsExp = memberExpression(modulePattern, exportsPattern)

module.exports = async function dist (options) {
  // Read modules package.json.
  const { pkg, path } = await readPkgUp()

  // Deconstruct options and set defaults if necessary.
  let {
    name = options.name || getShortName(pkg),
    input = options.input || require.resolve(join(dirname(path), pkg.module))
  } = options

  // Parse the source module to recast's Abstract Syntax Tree (AST).
  const ast = parse(readFileSync(resolve(input), 'utf8'), { parser })
  const cjsAst = pkg.main ? ast : null
  const browserAst = pkg.browser ? (pkg.main ? clone(cjsAst) : ast) : null

  // TODO: comment
  const windowExp = memberExpression(windowPattern, identifier(name))

  ast.program.body.forEach((t, index) => {
    let cjsExp
    let browserExp

    // export default ...
    if (namedTypes.ExportDefaultDeclaration.check(t)) {
      // TODO: comment
      let rightExp
      if (namedTypes.FunctionDeclaration.check(t.declaration)) {
        const { id, params, body } = t.declaration
        rightExp = functionExpression(id, params, body)
      }

      // TODO: comment
      if (cjsAst) {
        cjsExp = assignmentStatement('=', moduleExportsExp, rightExp).expression
      }
      if (browserAst) {
        browserExp = assignmentStatement('=', windowExp, rightExp).expression
      }
    }

    if (cjsExp) {
      cjsAst.program.body[index] = expressionStatement(cjsExp)
    }
    if (browserExp) {
      browserAst.program.body[index] = expressionStatement(browserExp)
    }
  })

  // TODO: comment
  const distPath = join(dirname(path), 'dist')
  const cjsPath = join(distPath, `${name}.js`)
  const browserPath = join(distPath, `${name}.browser.js`)
  return {
    ...(cjsAst ? { [cjsPath]: print(cjsAst).code } : {}),
    ...(browserAst ? { [browserPath]: print(browserAst).code } : {})
  }
}

