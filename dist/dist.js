const {
  dirname,
  join,
  resolve,
  extname
} = require("path");

const {
  readFileSync
} = require("fs");

const readPkgUp = require("read-pkg-up");

const {
  types,
  parse,
  print
} = require("recast");

const parser = require("recast/parsers/babel");

const {
  rollup
} = require("rollup");

function getShortName (pkg) {
  const parts = pkg.name.split('/')
  return parts.length ? parts[parts.length - 1] : null
}

const {
  ExportDefaultDeclaration,
  FunctionDeclaration,
  ImportDeclaration,
  ImportDefaultSpecifier
} = types.namedTypes
const {
  identifier,
  memberExpression,
  functionExpression,
  assignmentStatement,
  expressionStatement,
  literal,
  callExpression,
  variableDeclarator,
  variableDeclaration,
  objectPattern,
  objectProperty
} = types.builders
const modulePattern = identifier('module')
const exportsPattern = identifier('exports')
const moduleExportsExp = memberExpression(modulePattern, exportsPattern)
const requirePattern = identifier('require')

module.exports = async function dist(options) {
  // Read modules package.json.
  const { pkg, path } = await readPkgUp()

  // Deconstruct options and set defaults if necessary.
  const sourceModule = pkg.module || 'index.js'
  let {
    name = options.name || getShortName(pkg),
    input = options.input || resolve(join(dirname(path), sourceModule)),
    output = options.output || join(dirname(path), 'dist', `${name}.js`),
    cjs = options.cjs || pkg.main,
    browser = options.browser || pkg.browser
  } = options

  let ast
  if (cjs) {
    // Parse the source module to recast's Abstract Syntax Tree (AST).
    ast = parse(readFileSync(input, 'utf8'), { parser })

    ast.program.body.forEach((t, index) => {
      // export default ...
      if (ExportDefaultDeclaration.check(t)) {
        // TODO: comment
        let rExp = t.declaration
        if (FunctionDeclaration.check(t.declaration)) {
          const { id, params, body, async } = t.declaration
          rExp = functionExpression(id, params, body)
          rExp.async = async
        }

        // TODO: comment
        const { expression } = assignmentStatement('=', moduleExportsExp, rExp)
        ast.program.body[index] = expressionStatement(expression)

      // import ...
      } else if (ImportDeclaration.check(t)) {
        const sourceLiteral = literal(t.source.value)
        const callExp = callExpression(requirePattern, [sourceLiteral])

        let id
        if (ImportDefaultSpecifier.check(t.specifiers[0])) {
          id = t.specifiers[0].local
        } else {
          const toProps = s => ({
            // This is a workaround from:
            // https://github.com/benjamn/ast-types/issues/161
            ...objectProperty(s.local, s.local),
            shorthand: true
          })
          id = objectPattern.from({ properties: t.specifiers.map(toProps) })
        }

        const declarator = variableDeclarator(id, callExp)
        ast.program.body[index] = variableDeclaration('const', [declarator])
      }
    })
  }

  // TODO: comment
  let browserCode
  if (browser) {
    const bundle = await rollup({ input })
    const bundleOutput = await bundle.generate({ format: 'iife', name })
    browserCode = bundleOutput.output[0].code
  }

  // TODO: comment
  const cjsPath = extname(output) ? output : join(output, `${name}.js`)
  const dir = dirname(cjsPath)
  const browserPath = typeof browser === 'string' && extname(browser)
    ? resolve(browser)
    : join(dir, `${name}.browser.js`)

  return {
    ...(ast ? { [cjsPath]: print(ast).code } : {}),
    ...(browserCode ? { [browserPath]: browserCode } : {})
  }
};
