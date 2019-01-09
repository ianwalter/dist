#!/usr/bin/env node

const fs = require('fs')
const { dirname } = require('path')
const pify = require('pify')
const meow = require('meow')
const complete = require('@ianwalter/promise-complete')
const dist = require('.')
const { cyan, gray } = require('chalk')

const writeFile = pify(fs.writeFile)

async function run () {
  const cli = meow(
    `
      Usage
        dist

      Option
        --name, -n    Name to use for files and global variable (defaults to
                      name in package.json)
        --input, -i   Filename of source module (defaults to module in
                      package.json)
        --output, -o  Output filename or directory path (defaults to ./dist)
        --cjs, -c     Path for / whether to create a CommonJS dist file
                      (defaults to true and ./dist/{name}.js)
        --browser, -b Path for / whether to create a browser dist file (defaults
                      to false or browser in package.json or
                      ./dist/{name}.browser.js)

      Example
        ❯ npx dist
        💿 Writing CommonJS file: /myProject/dist/someName.js
        🕸 Writing Browser file: /myProject/dist/someName.browser.js
    `,
    {
      flags: {
        name: { type: 'string', alias: 'n' },
        input: { type: 'string', alias: 'i' },
        output: { type: 'string', alias: 'o' },
        cjs: { type: 'string', alias: 'c' },
        browser: { type: 'string', alias: 'b' }
      }
    }
  )

  try {
    // TODO: comment
    const files = await dist(cli.flags)
    const [filePath] = Object.keys(files)

    // TODO: comment
    fs.mkdirSync(dirname(filePath), { recursive: true })

    // TODO: comment
    const promises = []
    const addPromises = ([absolutePath, src]) => {
      const path = absolutePath.replace(`${process.cwd()}/`, '')
      if (path.includes('.browser.js')) {
        console.info(cyan('🌎 Writing Browser dist file:'), gray(path))
      } else {
        console.info(cyan('💿 Writing CommonJS dist file:'), gray(path))
      }
      promises.push(writeFile(absolutePath, src))
    }

    // TODO: comment
    Object.entries(files).forEach(addPromises)
    const results = await complete(promises)

    // TODO: comment
    results.filter(res => res && res.message).forEach(err => console.error(err))
  } catch (err) {
    // TODO: Format output with Chalk.
    console.error(err)
  }
}

run()
