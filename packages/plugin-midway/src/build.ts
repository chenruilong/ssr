import { join } from 'path'
import { execSync } from 'child_process'
import { Argv } from 'tiger-types'
import { judgeVersion, getCwd } from 'tiger-server-utils'

const build = async (argv: Argv) => {
  const { cli } = require('@midwayjs/cli/bin/cli')
  const cwd = getCwd()
  if (judgeVersion(require(join(cwd, './package.json')).dependencies['@midwayjs/decorator'])?.major === 2) {
    execSync('npx cross-env ets')
  }
  argv.c = true
  await cli(argv)
}

export {
  build
}
