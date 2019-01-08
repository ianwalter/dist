#!/usr/bin/env node

const fs = require('fs')
const { dirname } = require('path')
const pify = require('pify')
const meow = require('meow')
const complete = require('@ianwalter/promise-complete')
const dist = require('.')

const writeFile = pify(fs.writeFile)

async function run () {
  const cli = meow(
    `
      Usage
        dist

      Option
        --name, -n    Name to use for files and global variable (defaults to
                      package name)
        --input, -i   Filename of source module
        --output, -o  Output filename or directory path

      Example
        ❯ npx dist
        💿 Writing CommonJS file: /myProject/dist/someName.js
        🕸 Writing Browser file: /myProject/dist/someName.browser.js
    `,
    {
      flags: {
        name: { type: 'string', alias: 'n' },
        input: { type: 'string', alias: 'i' },
        output: { type: 'string', alias: 'o' }
      }
    }
  )

  try {
    // TODO: comment
    const files = await dist(cli.flags)

    // TODO: comment
    fs.mkdirSync(dirname(Object.keys(files)[0]), { recursive: true })

    // TODO: comment
    const promises = []
    const addPromises = ([path, src]) => {
      if (path.includes('.browser.js')) {
        console.info(`  🕸 Writing Browser file: ${path}\n`)
      } else {
        console.info(`  💿 Writing CommonJS file: ${path}\n`)
      }
      promises.push(writeFile(path, src))
    }
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
