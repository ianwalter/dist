import npmShortName from '@ianwalter/npm-short-name'
import chalk from 'chalk'
import message from './exportDefaultLiteral'

export default function greeting () {
  return chalk.cyan(npmShortName(message))
}
