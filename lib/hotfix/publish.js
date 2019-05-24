const help = require('../utils/help')
const { readConfig } = require('../utils/config')
const parseArgs = require('./args')
const log = require('../utils/log')
const gitP = require('simple-git/promise')
const inquirer = require('inquirer')
const slugify = require('slugify')

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
  let selectedBranche = status.current

  if (!status.current === 'master') {
    log('warn', 'You are not on master branch. Checking out...')
    try {
      await git.checkout('master')
    } catch (e) {
      log('fatal', 'Error during checkout')
      process.exit(1)
    }
  }

  if (featureBranches.length === 0) {
    log('error', 'No hotfix branche found')
    process.exit(1)
  }

  const hotfixBranches = await showAndSelectBranche(opts.directory, config.hotfix)
  const answer = await inquirer.prompt([
    {
      type: 'checkbox',
      message: 'Select a valid branche',
      name: 'selectedBranche',
      choices: hotfixBranches,
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

  try {
    await git.push(['origin', 'master'])
    await git.push(['origin', config.develop])
    await git.push(['origin', '--tags'])
  } catch (e) {
    log('fatal', 'Proplem during the push on the master and develop')
    process.exit(1)
  }

  log('success', `Hotfix published correctly`)
}

function cli (args) {
  init(args)
}

module.exports = cli