'use strict'

const gitP = require('simple-git/promise')
const { readConfig } = require('./config')

async function showAndSelectBranche (folder, brancheStart) {
  const git = gitP(folder)
  const res = await git.branch()

  let branchesToSelect = []
  for (let branche in res.branches) {
    if (branche.startsWith(brancheStart+'/')) {
      branchesToSelect.push(branche)
    }
  }

  return branchesToSelect
}

module.exports = {
  showAndSelectBranche
}
