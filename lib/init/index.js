'use strict'

const fs = require('fs')
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const child_process = require('child_process')
const path = require('path')
const inquirer = require('inquirer')
const gitP = require('simple-git/promise')
const parseArgs = require('./args')
const help = require('../utils/help')
const log = require('../utils/log')
const { printLocalBranches } = require('../utils/tables')
const { saveConfig } = require('../utils/config')
const { fileExists } = require('../utils/files')

async function init (args) {
  let opts = parseArgs(args)
  if (opts.help) {
    return help(path.resolve(__dirname, 'help.txt'))
  }

  const existProject = await fileExists(path.resolve(opts.directory))
  if (!existProject) {
    await mkdir(path.resolve(opts.directory))
    log('info', `Project folder ${path.resolve(opts.directory)} created`)
  }

  const exist = await fileExists(path.resolve(opts.directory, '.git'))
  if (!exist) {
    log('warn', `No repository found in ${path.resolve(opts.directory)} folder`)

    const prompt = inquirer.createPromptModule()
    const answers = await prompt([
      {
        type: 'confirm',
        name: 'initGit',
        message: `Want you create new git repository in ${opts.directory}`
      }
    ])

    if (!answers.initGit) {
      log('info','Nothing to configure')
      process.exit(0)
    }

    const mainBranches = await prompt([
      {
        type: 'input',
        name: 'gitRepository',
        message: 'Repository remote URL',
        default: 'git@github.com:username/repository',
        validate: function (answer) {
          if (answer === '') {
            return 'You need to specify a repository URL'
          }

          try {
            child_process.execSync('git ls-remote ' + answer.replace(/(\r\n|\n|\r)/gm, ''))
          } catch (e) {
            return 'The remote repository does not exist'
          }
          return true
        }
      },
      {
        type: 'input',
        name: 'develop',
        message: 'Branch name for "next release" development',
        default: 'develop',
        validate: function (answer) {
          if (answer === '') {
            return 'You need to specify a "next release" branche'
          }
          return true
        }
      }
    ])

    const git = gitP(opts.directory)
    try {
      await git.init()
      await git.addRemote('origin', mainBranches.gitRepository.replace(/(\r\n|\n|\r)/gm, ''))
      log('success', 'New repository initialized')
    } catch (e) {
      log('warn', `Can't create a new branch`)
    }

    log('info', 'How to name your supporting branch prefixes?', false)
    const secondaryBranches = await prompt([
      {
        type: 'input',
        name: 'feature',
        message: 'Feature branches',
        default: 'feature',
        validate: function(answer) {
          if (answer === '') {
            return 'You need to specify a feature release branche'
          }
          return true
        }
      },
      {
        type: 'input',
        name: 'release',
        message: 'Release branches',
        default: 'release',
        validate: function(answer) {
          if (answer === '') {
            return 'You need to specify a release branche'
          }
          return true
        }
      },
      {
        type: 'input',
        name: 'hotfix',
        message: 'Hotfix branches',
        default: 'hotfix',
        validate: function(answer) {
          if (answer === '') {
            return 'You need to specify a hotfix branche'
          }
          return true
        }
      },
      {
        type: 'input',
        name: 'versionTag',
        message: 'Version tag prefix',
        default: ''
      }
    ])

    const existReadme = await fileExists(path.resolve(opts.directory, 'README.md'))
    if (!existReadme) {
      await writeFile(path.resolve(opts.directory, 'README.md'), '', 'utf8')
      log('success', 'README.md file created')
    } else {
      log('info', 'README.md file preserved')
    }

    try {
      await git.add('.')
      log('success', 'README.md file staged')
    } catch (e) {
      log('warn', `Can't stage everything`)
      process.exit(0)
    }

    try {
      await git.commit("start")
      log('success', 'First commit committed')
    } catch (e) {
      log('warn', `Can't commit`)
      process.exit(0)
    }

    try {
      await git.addTag("v0.0.0")
      log('success', 'First tag v0.0.0 added')
    } catch (e) {
      log('warn', `Can't apply first tag`)
      process.exit(0)
    }

    await git.push(['-u', 'origin', 'master'])
    await git.checkoutBranch(mainBranches.develop, 'master')
    await git.push(['-u', 'origin', mainBranches.develop])
    try {
      const config = Object.assign(secondaryBranches, {
        develop: mainBranches.develop
      })

      await saveConfig(opts.directory, config)
    } catch (e) {
      log('fatal', e)
      process.exit(1)
    }

    printLocalBranches(opts.directory)
  } else {
    log('error', 'Project already configured')
    process.exit(0)
  }
}

function cli (args) {
  init(args)
}

module.exports = cli
