export enum CommandType {
  TEXT,
  MODIFIER,
  SPECIAL,
  DELAY,
  SET_DELAY,
  VKEY
}

export enum Modifier {
  SHIFT,
  CTRL,
  ALT
}

export interface AutoTypeCommand {
  type: CommandType
  modifier?: Modifier
  value: string | number
  repeat?: number
}
