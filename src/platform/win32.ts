import { spawn } from 'child_process'
import * as tmp from 'tmp'
import { AutoTypeCommand, CommandType, Modifier } from '../command'
import * as fs from 'fs'

const MODIFIERS = {
  [Modifier.SHIFT]: '+',
  [Modifier.CTRL]: '^',
  [Modifier.ALT]: '%'
}

const SPECIAL_KEYS: { [value: string]: string } = {
  tab: 'TAB',
  enter: 'ENTER',
  up: 'UP',
  down: 'DOWN',
  left: 'LEFT',
  right: 'RIGHT',
  insert: 'INSERT',
  delete: 'DELETE',
  home: 'HOME',
  end: 'END',
  pgup: 'PGUP',
  pgdn: 'PGDN',
  space: 'SPACE',
  backspace: 'BACKSPACE',
  capslock: 'CAPSLOCK',
  esc: 'ESC',
  lwin: 'LWIN',
  rwin: 'RWIN',
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
  numlock: 'NUMLOCK',
  add: 'ADD',
  subtract: 'SUBTRACT',
  multiply: 'MULTIPLY',
  divide: 'DIVIDE',
  numpad0: 'NUMPAD0',
  numpad1: 'NUMPAD1',
  numpad2: 'NUMPAD2',
  numpad3: 'NUMPAD3',
  numpad4: 'NUMPAD4',
  numpad5: 'NUMPAD5',
  numpad6: 'NUMPAD6',
  numpad7: 'NUMPAD7',
  numpad8: 'NUMPAD8',
  numpad9: 'NUMPAD9'
}

function escapeString(str: string) {
  return str.replace(/[+^%~{}\[\]()]/g, s => `{${s}}`)
}

function quote(str: string) {
  return str.replace(/`/g, '``').replace(/"/g, '`"')
}

function mapCommand(cmd: AutoTypeCommand) {
  let arg: string
  switch (cmd.type) {
    case CommandType.TEXT:
      arg = escapeString(cmd.value as string)
      return [
        `[System.Windows.Forms.SendKeys]::SendWait("${quote(arg)}")`,
        'Start-Sleep -Milliseconds 100'
      ]
    case CommandType.MODIFIER:
      arg = `${MODIFIERS[cmd.modifier!]}${escapeString(cmd.value as string)}`
      return [
        `[System.Windows.Forms.SendKeys]::SendWait("${quote(arg)}")`,
        'Start-Sleep -Milliseconds 100'
      ]
    case CommandType.DELAY:
      return [
        `Start-Sleep -Milliseconds ${cmd.value}`
      ]
    case CommandType.SPECIAL:
      const keycode = SPECIAL_KEYS[(cmd.value as string).toLowerCase()]
      return keycode ? [
        `[System.Windows.Forms.SendKeys]::SendWait("{${cmd.value}}")`,
        'Start-Sleep -Milliseconds 100'
      ] : []
  }
  return []
}

// for unit tests
export function mapSequenceToPowershellScript(sequence: AutoTypeCommand[]) {
  const statements = sequence.reduce((agg, cmd) => [...agg, ...mapCommand(cmd)], [] as string[])
  return `Add-Type -AssemblyName System.Windows.Forms\n${statements.join('\n')}\n`
}

function processSequence(sequence: AutoTypeCommand[]): Promise<void> {
  const script = mapSequenceToPowershellScript(sequence)

  return new Promise((resolve, reject) => {
    tmp.file({ mode: 0o644, prefix: 'script-', postfix: '.ps1' }, (err, path, fd, cleanupCallback) => {
      if (err) {
        reject(err)
        return
      }
      fs.write(fd, script, err1 => {
        if (err1) {
          reject(err1)
          return
        }
        fs.close(fd, err2 => {
          if (err2) {
            reject(err2)
            return
          }
          const ev = spawn('Powershell.exe', ['-ExecutionPolicy', 'ByPass', '-File', path])
          ev.on('close', code => {
            cleanupCallback()
            if (code > 0) {
              reject(new Error(`Powershell.exe exited with code ${code}`))
            } else {
              resolve()
            }
          })
          ev.on('error', reject)
        })
      })
    })
  })
}

export default processSequence
