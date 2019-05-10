import { autoType } from './index'

autoType(process.argv[2]).catch(err => console.log(err))
