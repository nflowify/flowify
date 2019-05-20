'use strict'

const argv = require('yargs-parser')
const path = require('path')

module.exports = function parseArgs (args) {
  const parsedArgs = argv(args, {
    string: ['directory'],
    boolean: ['help'],
    alias: {
      help: ['h'],
      directory: ['d']
    }
  })

  return Object.assign({}, {
    _: parsedArgs._,
    help: parsedArgs.help || false,
    directory: parsedArgs.directory ? path.resolve(parsedArgs.directory) : process.cwd()
  })
}
