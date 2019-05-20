'use strict'

const emoji = {
  warn: '⚠️',
  info: '✨',
  error: '🚨',
  debug: '🐛',
  fatal: '💀',
  trace: '🔍',
  success: '✔️'
}

const chalk = require('chalk')

const levels = {
  debug: 0,
  info: 1,
  error: 2,
  success: 3,
  warn: 4,
  trace: 5,
  fatal: 6
}

const colors = [
  chalk.white,
  chalk.blue,
  chalk.red,
  chalk.green,
  chalk.yellow,
  chalk.red,
  chalk.magenta
]

function log (level, message, icon = true) {
  const severity = levels[level] || 0
  message = ` ${message}`

  console.log((icon ? (emoji[level] + ' ') : '') + colors[severity](message))
}

module.exports = log
