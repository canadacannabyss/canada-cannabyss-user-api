// eslint-disable-next-line no-unused-vars
const _ = require('lodash');

const config = require('./globalMulterVariables.json');

const defaultConfig = config.multer;

global.gConfigMulter = defaultConfig;

console.log('global.gConfig:', global.gConfigMulter);
