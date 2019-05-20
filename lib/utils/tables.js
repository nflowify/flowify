'use strict'

const gitP = require('simple-git/promise')
const Table = require('cli-table')

async function printLocalBranches (folder) {
  const git = gitP(folder)
  let res = await git.branchLocal()
  let table = new Table({
      head: ['Branch Name', 'Commit', 'Label', 'Current'],
      colWidths: [20, 21, 25, 17]
  })

  for (let branche in res.branches) {
    table.push([res.branches[branche].name, res.branches[branche].commit, res.branches[branche].label, res.branches[branche].current])
  }

  console.log(table.toString())
}

module.exports = {
  printLocalBranches
}
