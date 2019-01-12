import npmShortName from '@ianwalter/npm-short-name'
import message from './exportDefaultLiteral'

export default function greeting () {
  return npmShortName(message)
}
