#!/usr/bin/env node

const util = require('util');
const path= require('path');

const [nodeDir,dir,cmd,...args]=process.argv
console.log('nodeDir,',nodeDir)
console.log('dirdir,',dir)
const exec =require('child_process').execSync



switch (cmd) {

    case "create":
        const project=args && args[0] || 'mandarina'
        const projectDir = path.join(process.cwd(), project);
        const npmDir = path.resolve(nodeDir,'../npm')
        console.log('creating project')
        exec(`git clone git@github.com:cesarve77/mandarina-boilerplate.git ${project}`)
        console.log('installing dependencies')
        exec(`cd ${project} && npm i`)
        break
    case undefined:
        console.log(`You need to pass a command at first argument`)
        break
    default:
        console.log(`command ${cmd} not found`)
}




async function create(project) {

    //console.log(await exec(`git clone git@github.com:cesarve77/mandarina-boilerplate.git ${project}`))
    const projectDir = path.join(process.cwd(), project);
    console.log(await exec(`open  -n -a Terminal \"npm run server\"`,{
        shell: true,
        cwd: projectDir,
    }))
}

/*



let child = exec ();
 */