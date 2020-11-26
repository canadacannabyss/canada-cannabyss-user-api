// eslint-disable-next-line no-unused-vars
import _ from 'lodash'

// interface IMulterConfig {
//   multer: {
//     type: string
//     title: string
//     folder_namne: string
//     destination: string
//   }
// }

import config from './globalMulterVariables.json'

const defaultConfig = config.multer

global.gConfigMulter = defaultConfig

console.log('global.gConfig:', global.gConfigMulter)
