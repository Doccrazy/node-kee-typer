import { AutoTypeCommand, CommandType, Modifier } from './command'

const TOKEN = /(?:{([^{ ]{2,})(?: (\d+))?})|(?:([+^%])(.))|~/

const MODIFIER_KEYS = {
  '+': Modifier.SHIFT,
  '^': Modifier.CTRL,
  '%': Modifier.ALT
}

const CMD_SHORTCUTS: { [key: string]: string } = {
  INS: 'INSERT',
  DEL: 'DELETE',
  BS: 'BACKSPACE',
  BKSP: 'BACKSPACE',
  WIN: 'LWIN'
}

export default function tokenize(sequenceString: string) {
  let str = sequenceString
  const result: AutoTypeCommand[] = []
  let m = TOKEN.exec(sequenceString)
  while (m) {
    if (m.index > 0) {
      result.push({ type: CommandType.TEXT, value: clean(str.substr(0, m.index)) })
    }
    if (m[1]) {
      const cmd = m[1]
      const param = m[2] ? Number.parseInt(m[2], 10) : undefined
      if (cmd === 'DELAY' && param) {
        result.push({ type: CommandType.DELAY, value: param })
      } else if (cmd === 'VKEY' && param) {
        result.push({ type: CommandType.VKEY, value: param })
      } else if (cmd.startsWith('DELAY=')) {
        result.push({ type: CommandType.SET_DELAY, value: Number.parseInt(cmd.substring(6), 10) })
      } else {
        result.push({ type: CommandType.SPECIAL, value: CMD_SHORTCUTS[cmd] || cmd, repeat: param })
      }
    } else if (m[3]) {
      const key = m[3] as keyof typeof MODIFIER_KEYS
      const value = m[4]
      result.push({ type: CommandType.MODIFIER, modifier: MODIFIER_KEYS[key], value })
    } else if (m[0] === '~') {
      result.push({ type: CommandType.SPECIAL, value: 'ENTER' })
    } else {
      /* istanbul ignore next */
      throw new Error(`Unexpected token ${m}`)
    }
    str = str.substring(m.index + m[0].length)
    m = TOKEN.exec(str)
  }
  if (str) {
    result.push({ type: CommandType.TEXT, value: clean(str) })
  }
  return result
}

/**
 * replaces remaining single-char escape sequences by the escaped character, e.g. "{{}foo{}}" -> "{foo}"
 */
function clean(plainStr: string) {
  return plainStr.replace(/{(.)}/g, (m, [ch]) => ch)
}
