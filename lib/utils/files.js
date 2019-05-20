'use strict'

const fs = require('fs')
const { promisify } = require('util')
const access = promisify(fs.access)

async function fileExists (file) {
  try {
    await access(file, fs.F_OK)
  } catch (e) {
    return false
  }
  return true
}

module.exports = {
  fileExists
}
