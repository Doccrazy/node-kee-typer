import { AutoTypeCommand } from '../command'

type PlatformProcessSequence = (sequence: AutoTypeCommand[]) => Promise<void>

export default PlatformProcessSequence
