// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
const packageContent=require('./package.json')
const { pathsToModuleNameMapper } = require('ts-jest')



module.exports = {
    ...packageContent.jest,
    "moduleNameMapper": {
        "^mandarina(.*)": "<rootDir>/../mandarina$1/src",
    },
}
