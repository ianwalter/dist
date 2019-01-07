#!/usr/bin/env node

const fs = require('fs')
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
        --name, -n  Name to use for files and global variable (defaults to package
                    name)
        --input, -i Filename of source module

      Example
        ❯ npx dist
        💿 CommonJS file created: dist/someName.js
        🕸 Browser file created: dist/someName.browser.js
    `,
    {
      flags: {
        name: { type: 'string', alias: 'n' },
        input: { type: 'string', alias: 'i' }
      }
    }
  )

  try {
    // TODO: comment
    const files = await dist(cli.flags)

    // TODO: comment
    const promises = []
    const addPromises = ([path, src]) => promises.push(writeFile(path, src))
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
