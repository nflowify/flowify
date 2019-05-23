'use strict'

const help = require('../utils/help')
const { readConfig } = require('../utils/config')
const parseArgs = require('./args')
const log = require('../utils/log')
const gitP = require('simple-git/promise')
const { showAndSelectBranche } = require('../utils/git')
const inquirer = require('inquirer')

async function init (args) {
  let opts = parseArgs(args)
  if (opts.help) {
    return help(path.resolve(__dirname, 'help.txt'))
  }

  let config
  try {
    config = await readConfig(opts.directory)
  } catch (e) {
    log('error', e)
    process.exit(1)
  }

  const git = gitP(opts.directory)
  let status = await git.status()
  console.log(status)
  process.exit(1)
  let selectedBranche = status.current

  if (!status.current.startsWith(`${config.feature}/`)) {
    log('warn', 'You are not on feature branch')
    const featureBranches = await showAndSelectBranche(opts.directory, config.feature)

    if (featureBranches.length === 0) {
      log('error', 'No feature branche found')
      process.exit(1)
    }

    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        message: 'Select a valid branche',
        name: 'selectedBranche',
        choices: featureBranches,
        validate: function(answer) {
          if (answer.length < 1) {
            return 'You must choose at least one feature branche.'
          }

          if (answer.length > 1) {
            return 'You can choose at least one feature branche.'
          }
          return true
        }
      }
    ])
    selectedBranche = answer.selectedBranche[0]
  }

  await git.checkout(selectedBranche)
  status = await git.status()

  if (status.files.length > 0) {
    log('warn', `You need to clean commit history. The following files are uncommitted for feature ${selectedBranche}:`)
    for (let file of status.files) {
      log('error', `  → ${file.path}`, false)
    }
    process.exit(1)
  }

  try {
    await git.checkout(config.develop)
    await git.merge(['--no-ff', selectedBranche])
    await git.branch(['-d', selectedBranche])
  } catch (e) {
    log('fatal', `Error during checkout/push ${selectedBranche}`)
    log('fatal', e)
    process.exit(1)
  }

  log('success', `Branche ${selectedBranche} finished correctly`)
}

function cli (args) {
  init(args)
}

module.exports = cli
