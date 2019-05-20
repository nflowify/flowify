'use strict'

const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const chalk = require('chalk')

module.exports = async function (help) {
  try {
    const file = await readFile(help, 'utf8')
    console.log(chalk.blue(file))
  } catch (e) {
    throw new Error(e)
  }
}
