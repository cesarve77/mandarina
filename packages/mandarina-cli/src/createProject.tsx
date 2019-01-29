const exec = require('child_process').execSync


export const createProject=(name: string)=>{
    console.log(`creating project ${name}`)
    exec(`git clone git@github.com:cesarve77/mandarina-boilerplate.git ${name}`)
    exec(`cd ${name} && npm i`)
    console.log(`done!`)
}