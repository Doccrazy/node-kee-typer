import tokenize from './tokenize'
import PlatformProcessSequence from './platform/platform'
import { AutoTypeCommand } from './command'
import processSequenceWin32 from './platform/win32'
import processSequenceLinux from './platform/linux'

let processSequence: PlatformProcessSequence

switch (process.platform) {
  case 'win32':
    processSequence = processSequenceWin32
    break
  case 'linux':
    processSequence = processSequenceLinux
    break
  default:
    throw new Error(`Unsupported platform ${process.platform}`)
}

export function autoType(sequence?: string | AutoTypeCommand[]): Promise<void> {
  if (!sequence) {
    return Promise.resolve()
  }
  const tokenizedSequence = typeof sequence === 'string' ? tokenize(sequence) : sequence
  return processSequence(tokenizedSequence)
}

export function parseSequence(sequence?: string) {
  if (!sequence) {
    return []
  }
  return tokenize(sequence)
}
