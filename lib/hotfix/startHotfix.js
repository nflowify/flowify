'use strict'

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
  try {
    await git.checkout('master')
  } catch (e) {
    log('fatal', `I don't find a master branche`)
    process.exit(1)
  }

  let hotfixName = opts.name || ''
  if (!opts.name) {
    const prompt = inquirer.createPromptModule()
    const answers = await prompt([
      {
        type: 'input',
        name: 'hotfixName',
        message: 'Your Hotfix name',
        default: 'my-hotfix',
        validate: function (answer) {
          if (answer === '') {
            return 'You need to specify an hotfix name'
          }
          return true
        }
      }
    ])
    hotfixName = answers.hotfixName
  }

  hotfixName = slugify(hotfixName)
  let brancheName
  try {
    brancheName = `${config.hotfix}/${hotfixName}`
    await git.checkoutBranch(brancheName, 'master')
    await git.push(['-u', 'origin', brancheName])
  } catch (e) {
    log('error', `Can't checkout ${brancheName} from master branche`)
    process.exit(1)
  }

  log('success', `Hotfix branche ${brancheName} started!`)
}

function cli (args) {
  init(args)
}

module.exports = cli
