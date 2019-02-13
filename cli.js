#!/usr/bin/env node

const fs = require('fs')
const { dirname } = require('path')
const pify = require('pify')
const meow = require('meow')
const promiseComplete = require('@ianwalter/promise-complete')
const dist = require('.')
const { cyan, gray, yellow, red } = require('chalk')

const writeFile = pify(fs.writeFile)
const logError = err => console.error(`💥 ${red('Boom!')}`, err)

async function run () {
  const cli = meow(
    `
      Usage
        dist

      Option
        --name, -n      Name to use for files and global variable (defaults to
                        name in package.json)
        --input, -i     Filename of source/entry file (defaults to
                        {cwd}/index.js)
        --output, -o    Output filename or directory path (defaults to ./dist)
        --cjs, -c       Path for / whether to create a CommonJS dist file
                        (defaults to false or main in package.json)
        --esm, -e       Path for / whether to create a ESM dist file (defaults
                        to false or module in package.json)
        --browser , -b  Path for / whether to create a browser-specific (ESM)
                        dist file (defaults to false or browser in package.json)
        --inline, -l    Inline/bundle imported modules (defaults to false)
        --babel         Transpile output with Babel (defaults to false)
        --plugins, -p   Specify a path for a Rollup plugins file to include

      Example
        ❯ yarn dist
        💿 Writing CommonJS file: /myProject/dist/someName.js
        📦 Writing ES Module file: /myProject/dist/someName.m.js
        🌎 Writing Browser file: /myProject/dist/someName.browser.js
    `,
    {
      flags: {
        name: { type: 'string', alias: 'n' },
        input: { type: 'string', alias: 'i' },
        output: { type: 'string', alias: 'o' },
        cjs: { type: 'string', alias: 'c' },
        esm: { type: 'string', alias: 'e' },
        browser: { type: 'string', alias: 'b' },
        inline: { type: 'string', alias: 'l' },
        babel: { type: 'boolean' },
        plugins: { type: 'string', alias: 'p' }
      }
    }
  )

  try {
    // Perform distribution file generation and get back a map of files to be
    // written to the filesystme.
    const files = Object.entries(await dist(cli.flags))
    if (files.length) {
      const writes = []
      files.forEach(([moduleType, [path, code]]) => {
        // Make the file's containing directory if it doesn't exist.
        fs.mkdirSync(dirname(path), { recursive: true })

        // Inform the user about what files are being written.
        const relative = path.replace(`${process.cwd()}/`, '')
        if (moduleType === 'cjs') {
          console.info(cyan('💿 Writing CommonJS dist file:'), gray(relative))
        } else if (moduleType === 'esm') {
          console.info(cyan('📦 Writing ES Module dist file:'), gray(relative))
        } else if (moduleType === 'browser') {
          console.info(cyan('🌎 Writing Browser dist file:'), gray(relative))
        }

        // Add the file write operation to the list of writes to be completed
        writes.push(writeFile(path, code))
      })

      // Perform all of the writes in parallel, regardless of whether errors are
      // encountered in individual operations.
      const results = await promiseComplete(writes)

      // Filter the results for errors and log them.
      results.filter(r => r instanceof Error).forEach(err => logError(err))
    } else {
      console.warn(yellow('🤷 No distribution files were specified'))
    }
  } catch (err) {
    logError(err)
  }
}

run()
