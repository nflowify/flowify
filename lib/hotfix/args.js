'use strict'

const argv = require('yargs-parser')
const path = require('path')

module.exports = function parseArgs (args) {
  const parsedArgs = argv(args, {
    string: ['directory', 'name'],
    boolean: ['help'],
    alias: {
      help: ['h'],
      directory: ['d'],
      name: ['n']
    }
  })

  return Object.assign({}, {
    _: parsedArgs._,
    help: parsedArgs.help || false,
    name: parsedArgs.name || '',
    directory: parsedArgs.directory ? path.resolve(parsedArgs.directory) : process.cwd()
  })
}
