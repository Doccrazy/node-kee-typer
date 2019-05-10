import { spawn } from 'child_process'
import { AutoTypeCommand, CommandType, Modifier } from '../command'

const MODIFIERS = {
  [Modifier.SHIFT]: 'Shift_L',
  [Modifier.CTRL]: 'Control_L',
  [Modifier.ALT]: 'Alt_L'
}

const SPECIAL_KEYS: { [value: string]: string } = {
  tab: 'Tab',
  enter: 'Return',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  insert: 'Insert',
  delete: 'Delete',
  home: 'Home',
  end: 'End',
  pgup: 'Page_Up',
  pgdn: 'Page_Down',
  space: 'space',
  backspace: 'BackSpace',
  capslock: 'Caps_Lock',
  esc: 'Escape',
  lwin: 'Super_L',
  rwin: 'Super_R',
  f1: 'F1',
  f2: 'F2',
  f3: 'F3',
  f4: 'F4',
  f5: 'F5',
  f6: 'F6',
  f7: 'F7',
  f8: 'F8',
  f9: 'F9',
  f10: 'F10',
  f11: 'F11',
  f12: 'F12',
  numlock: 'Num_Lock',
  add: 'KP_Add',
  subtract: 'KP_Subtract',
  multiply: 'KP_Multiply',
  divide: 'KP_Divide',
  numpad0: 'KP_0',
  numpad1: 'KP_1',
  numpad2: 'KP_2',
  numpad3: 'KP_3',
  numpad4: 'KP_4',
  numpad5: 'KP_5',
  numpad6: 'KP_6',
  numpad7: 'KP_7',
  numpad8: 'KP_8',
  numpad9: 'KP_9'
}

function mapCommand(cmd: AutoTypeCommand) {
  switch (cmd.type) {
    case CommandType.TEXT:
      return [`str ${cmd.value}`]
    case CommandType.MODIFIER:
      return [`keydown ${MODIFIERS[cmd.modifier!]}`, `key ${cmd.value}`, `keyup ${MODIFIERS[cmd.modifier!]}`]
    case CommandType.DELAY:
      return [`usleep ${cmd.value}`]
    case CommandType.SPECIAL:
      const keycode = SPECIAL_KEYS[(cmd.value as string).toLowerCase()]
      return keycode ? [`key ${keycode}`] : []
  }
  return []
}

// for unit tests
export function mapSequenceToXteCommands(sequence: AutoTypeCommand[]) {
  return sequence.reduce((agg, cmd) => [...agg, ...mapCommand(cmd)], [] as string[])
}

function processSequence(sequence: AutoTypeCommand[]): Promise<void> {
  const xteCommands = mapSequenceToXteCommands(sequence)
  return new Promise((resolve, reject) => {
    const ev = spawn('/usr/bin/xte', [...Object.values(MODIFIERS).map(m => `keyup ${m}`), ...xteCommands])
    ev.on('close', resolve)
    ev.on('error', reject)
  })
}

export default processSequence
