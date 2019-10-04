import {getConfig} from "./utils";

const exec = require('child_process').execSync




export const deploy=()=>{
    const config=getConfig()
    if (!config) return
    console.info('deploying')
    exec(`cd prisma && PRISMA_MANAGEMENT_API_SECRET=${config.secret} prisma deploy`)
    console.info('done!')
}
