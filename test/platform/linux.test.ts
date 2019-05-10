import { mapSequenceToXteCommands } from '../../src/platform/linux'
import { CommandType, Modifier } from '../../src/command'

test('mapping', () => {
  expect(mapSequenceToXteCommands([])).toEqual([])
  expect(mapSequenceToXteCommands([
    { type: CommandType.SPECIAL, value: 'TAB', repeat: 5 },
    { type: CommandType.TEXT, value: '{Some text' },
    { type: CommandType.DELAY, value: 100 },
    { type: CommandType.VKEY, value: 123 },
    { type: CommandType.MODIFIER, modifier: Modifier.CTRL, value: 'v' }
  ])).toEqual(['key Tab', 'str {Some text', 'usleep 100', 'keydown Control_L', 'key v', 'keyup Control_L'])
})
