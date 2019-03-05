import {genFile} from "./gen-files/genFiles";
import fs from "fs";
import {getConfig} from "./utils";


export const watch = () => {
    const config = getConfig()
    if (!config) return
    const dir = config.dir
    dir.schemas.forEach((dir) => {
        fs.watch(dir, genFile)
    })
    if (dir.tables) {
        dir.tables.forEach((dir) => {
            fs.watch(dir, genFile)
        })
    }
}
