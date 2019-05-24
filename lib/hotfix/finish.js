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
  let selectedBranche = status.current

  if (!status.current.startsWith(`${config.hotfix}/`)) {
    log('warn', 'You are not on hotfix branch')
    const hotfixBranches = await showAndSelectBranche(opts.directory, config.hotfix)

    if (hotfixBranches.length === 0) {
      log('error', 'No hotfix branche found')
      process.exit(1)
    }

    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        message: 'Select a valid branche',
        name: 'selectedBranche',
        choices: hotfixBranches,
        validate: function(answer) {
          if (answer.length < 1) {
            return 'You must choose at least one hotfix branche.'
          }

          if (answer.length > 1) {
            return 'You can choose at least one hotfix branche.'
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
    log('warn', `You need to clean commit history. The following files are uncommitted for hotfix ${selectedBranche}:`)
    for (let file of status.files) {
      log('error', `  → ${file.path}`, false)
    }
    process.exit(1)
  }

  const version = selectedBranche.replace(`/${config.hotfix}\//`, '')
  for (let branche of ['master', config.develop]) {
    try {
      await git.checkout(branche)
      await git.merge(['--no-ff', selectedBranche])
      await git.tag(['-a', version])
      log('success', `
        Checkout of branche ${branche}
        Merged ${selectedBranche} into ${branche}
        Tag ${version} added to ${branche}
      `)
    } catch (e) {
      log('fatal', `Error while add the tag ${tag} to the ${branche} branche`)
      log('fatal', e)
      process.exit(1)
    }
  }

  try {
    await git.branch(['-d', selectedBranche])
    log('success', `Branche ${selectedBranche} deleted`)
  } catch (e) {
    log('fatal', `Error while deleting ${selectedBranche} branche`)
    log('fatal', e)
    process.exit(1)
  }
}

function cli (args) {
  init(args)
}

module.exports = cli
