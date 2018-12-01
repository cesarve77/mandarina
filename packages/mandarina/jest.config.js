// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html
const packageContent=require('./package.json')
module.exports = {
    ...packageContent.jest,
}
