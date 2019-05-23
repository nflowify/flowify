'use strict'

const argv = require('yargs-parser')
const path = require('path')

module.exports = function parseArgs (args) {
  const parsedArgs = argv(args, {
    string: ['directory', 'version'],
    boolean: ['help'],
    alias: {
      help: ['h'],
      directory: ['d'],
      version: ['v']
    }
  })

  return Object.assign({}, {
    _: parsedArgs._,
    help: parsedArgs.help || false,
    version: parsedArgs.version || '',
    directory: parsedArgs.directory ? path.resolve(parsedArgs.directory) : process.cwd()
  })
}
