import * as fs from 'fs'
import processSequence, { mapSequenceToPowershellScript } from '../../src/platform/win32'
import { CommandType, Modifier } from '../../src/command'

jest.mock('child_process')

test('mapping', () => {
  expect(mapSequenceToPowershellScript([]).trim()).toEqual('Add-Type -AssemblyName System.Windows.Forms')
  expect(mapSequenceToPowershellScript([
    { type: CommandType.SPECIAL, value: 'TAB', repeat: 5 },
    { type: CommandType.TEXT, value: '{Some `text"' },
    { type: CommandType.DELAY, value: 100 },
    { type: CommandType.VKEY, value: 123 },
    { type: CommandType.MODIFIER, modifier: Modifier.CTRL, value: 'v' }
  ])).toEqual(
    'Add-Type -AssemblyName System.Windows.Forms\n' +
    '[System.Windows.Forms.SendKeys]::SendWait("{TAB}")\n' +
    'Start-Sleep -Milliseconds 100\n' +
    '[System.Windows.Forms.SendKeys]::SendWait("{{}Some ``text`"")\n' +
    'Start-Sleep -Milliseconds 100\n' +
    'Start-Sleep -Milliseconds 100\n' +
    '[System.Windows.Forms.SendKeys]::SendWait("^v")\n' +
    'Start-Sleep -Milliseconds 100\n'
  )
})

test('spawn', async () => {
  await processSequence([{ type: CommandType.SPECIAL, value: 'TAB', repeat: 5 }])
  const spawnArgs = require('child_process').__lastSpawn
  expect(spawnArgs.cmd).toEqual('Powershell.exe')
  expect(spawnArgs.args[0]).toEqual('-ExecutionPolicy')
  expect(spawnArgs.args[1]).toEqual('ByPass')
  expect(spawnArgs.args[2]).toEqual('-File')
  const content = fs.readFileSync(spawnArgs.args[3], 'utf-8')
  expect(content).toBe('Add-Type -AssemblyName System.Windows.Forms\n' +
    '[System.Windows.Forms.SendKeys]::SendWait("{TAB}")\n' +
    'Start-Sleep -Milliseconds 100\n')
})
