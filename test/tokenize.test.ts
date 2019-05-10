import tokenize from '../src/tokenize'
import { CommandType, Modifier } from '../src/command'

test('full tokenize', () => {
  const sequence = tokenize('{USERNAME}{TAB 5}{{}Some text^v to~ be sent!{}}{ENTER}rest')
  expect(sequence).toEqual([
    { type: CommandType.SPECIAL, value: 'USERNAME' },
    { type: CommandType.SPECIAL, value: 'TAB', repeat: 5 },
    { type: CommandType.TEXT, value: '{Some text' },
    { type: CommandType.MODIFIER, modifier: Modifier.CTRL, value: 'v' },
    { type: CommandType.TEXT, value: ' to' },
    { type: CommandType.SPECIAL, value: 'ENTER' },
    { type: CommandType.TEXT, value: ' be sent!}' },
    { type: CommandType.SPECIAL, value: 'ENTER' },
    { type: CommandType.TEXT, value: 'rest' }
  ])
})

test('delay vkey', () => {
  const sequence = tokenize('{DELAY 50}Foo DELAY{DELAY=100}Bar{VKEY 123}')
  expect(sequence).toEqual([
    { type: CommandType.DELAY, value: 50 },
    { type: CommandType.TEXT, value: 'Foo DELAY' },
    { type: CommandType.SET_DELAY, value: 100 },
    { type: CommandType.TEXT, value: 'Bar' },
    { type: CommandType.VKEY, value: 123 }
  ])
})

test('corner cases', () => {
  let sequence = tokenize('{ENTER}')
  expect(sequence).toEqual([
    { type: CommandType.SPECIAL, value: 'ENTER' }
  ])

  sequence = tokenize('Foo bar')
  expect(sequence).toEqual([
    { type: CommandType.TEXT, value: 'Foo bar' }
  ])

  sequence = tokenize('')
  expect(sequence).toEqual([])
})
