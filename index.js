import { dirname, join, resolve, extname } from 'path'
import { readFileSync } from 'fs'
import readPkgUp from 'read-pkg-up'
import { types, parse, print } from 'recast'
import parser from 'recast/parsers/babel'
import clone from '@ianwalter/clone'

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
const windowPattern = identifier('window')
const exportsPattern = identifier('exports')
const moduleExportsExp = memberExpression(modulePattern, exportsPattern)
const requirePattern = identifier('require')

export default async function dist (options) {
  // Read modules package.json.
  const { pkg, path } = await readPkgUp()

  // Deconstruct options and set defaults if necessary.
  let {
    name = options.name || getShortName(pkg),
    input = options.input || require.resolve(join(dirname(path), pkg.module)),
    output = options.output || join(dirname(path), 'dist', `${name}.js`)
  } = options

  // Parse the source module to recast's Abstract Syntax Tree (AST).
  const ast = parse(readFileSync(resolve(input), 'utf8'), { parser })
  const cjsAst = pkg.main ? ast : null
  const browserAst = pkg.browser ? (pkg.main ? clone(cjsAst) : ast) : null

  // TODO: comment
  const windowExp = memberExpression(windowPattern, identifier(name))

  ast.program.body.forEach((t, index) => {
    // export default ...
    if (ExportDefaultDeclaration.check(t)) {
      // TODO: comment
      let rExp
      if (FunctionDeclaration.check(t.declaration)) {
        const { id, params, body, async } = t.declaration
        rExp = functionExpression(id, params, body)
        rExp.async = async
      }

      // TODO: comment
      if (cjsAst) {
        const { expression } = assignmentStatement('=', moduleExportsExp, rExp)
        cjsAst.program.body[index] = expressionStatement(expression)
      }
      if (browserAst) {
        const { expression } = assignmentStatement('=', windowExp, rExp)
        browserAst.program.body[index] = expressionStatement(expression)
      }

    // import ...
    } else if (ImportDeclaration.check(t)) {
      if (cjsAst) {
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
        cjsAst.program.body[index] = variableDeclaration('const', [declarator])
      }
    }
  })

  // TODO: comment
  const filename = extname(output)
  const cjsPath = filename ? output : join(output, `${name}.js`)
  const browserPath = join(dirname(output), `${name}.browser.js`)
  return {
    ...(cjsAst ? { [cjsPath]: print(cjsAst).code } : {}),
    ...(browserAst ? { [browserPath]: print(browserAst).code } : {})
  }
}
