'use strict'

const fs = require('fs')
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const path = require('path')
const log = require('./log')

async function saveConfig (dir, opts) {
  const jsonConfig = Object.assign({}, opts)

  try {
    await writeFile(path.join(dir, '.git', 'config.json'), JSON.stringify(jsonConfig, null, 2), 'utf8')
  } catch (e) {
    throw new Error(`Can't write config file!`)
  }
}

async function readConfig (dir) {
  try {
    const content = await readFile(path.join(dir, '.git', 'config.json'), 'utf8')
    return JSON.parse(content)
  } catch (e) {
    throw new Error(`Can't read the configuration file!`)
  }
}

module.exports = {
  saveConfig,
  readConfig
}
