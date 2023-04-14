#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createProject_1 = require("./createProject");
var watch_1 = require("./watch");
var deploy_1 = require("./deploy");
var genFiles_1 = require("./gen-files/genFiles");
var prisma2_1 = require("./gen-files/prisma2");
//@ts-ignore
var _a = process.argv, nodeDir = _a[0], dir = _a[1], cmd = _a[2], args = _a.slice(3);
switch (cmd) {
    case "create":
        var project = args && args[0] || 'mandarina';
        createProject_1.createProject(project);
        break;
    case 'gen-files':
        genFiles_1.genFile();
        break;
    case 'gen-prisma2':
        prisma2_1.genFile();
        break;
    case 'deploy':
        deploy_1.deploy();
        break;
    case 'watch':
        watch_1.watch();
        break;
    case undefined:
        console.info("You need to pass a command at first argument");
        break;
    default:
        console.info("command " + cmd + " not found, available commands: \"create\",\"gen-files\",\"deploy\",\"watch");
}
/*
const Mandarina = require("../mandarina/build/Mandarina").Mandarina
const path = require('path');
const fs = require('fs');

const [nodeDir, dir, cmd, ...args] = process.argv
const exec = require('child_process').execSync


const walkSync = function (dir, filelist) {
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        const pathFile = path.join(dir, file)
        if (fs.statSync(pathFile).isDirectory()) {
            filelist = walkSync(pathFile, filelist);
        } else {
            if (path.extname(file) === '.js') filelist.push(pathFile);
        }
    });
    return filelist;
};
let rawData = fs.readFileSync(path.join(process.cwd(), 'mandarina.json'))
let config = JSON.parse(rawData), schemas = [], tables = []

const saveFiles = () => {

}

const deploy = () => {
    console.log('deploying' + config.secret)
    exec(`cd prisma && PRISMA_MANAGEMENT_API_SECRET=${config.secret} prisma deploy`)
    console.log('done!')
}


switch (cmd) {
    case "create":
        const project = args && args[0] || 'mandarina'
        console.log('creating project')
        exec(`git clone git@github.com:cesarve77/mandarina-boilerplate.git ${project}`)
        console.log('installing dependencies')
        exec(`cd ${project} && npm i`)
        break
    case 'gen-files':
        saveFiles()
        break;
    case 'deploy':
        deploy()
        break;
    case 'watch':
        config.dir.schemas.forEach((dir) => {
            fs.watch(dir, saveFiles)
        })
        config.dir.tables.forEach((dir) => {
            fs.watch(dir, saveFiles)
        })
        deploy()
        break;
    case undefined:
        console.log(`You need to pass a command at first argument`)
        break
    default:
        console.log(`command ${cmd} not found`)
}


async function create(project) {

    //console.log(await exec(`git clone git@github.com:cesarve77/mandarina-boilerplate.git ${project}`))
    const projectDir = path.join(process.cwd(), project);
    console.log(await exec(`open  -n -a Terminal \"npm run server\"`, {
        shell: true,
        cwd: projectDir,
    }))
}


*/
//# sourceMappingURL=index.js.map