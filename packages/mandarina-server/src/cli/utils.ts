import fs from "fs";
import path from "path";

export const getConfig = (): ConfigInterface => {
    let rawData
    try {
        rawData = fs.readFileSync(path.join(process.cwd(), 'mandarina.json'), 'utf8')
    } catch (e) {
        throw Error('Error: Be sure you are in a mandarina project and has a madarina.json file')
    }
    const config = JSON.parse(rawData)
    if (!config.secret) {
        throw Error('Error: please set "secret" in  madarina.json file')
    }
    if (!config.dir) {
        throw Error('Error: please set "dir" in  madarina.json file')
    }
    if (!config.dir.schemas || !Array.isArray(config.dir.schemas) || config.dir.schemas.length === 0) {
        throw Error('Error: please set "dir.schemas" in  madarina.json file. Make sure it is a array')
    }
    if (config.dir.actions && !Array.isArray(config.dir.actions)) {
        throw Error('Error: please make sure "dir.actions" is a array')
    }
    if (config.dir.tables && !Array.isArray(config.dir.tables)) {
        throw Error('Error: please make sure "dir.tables" is a array')
    }
    if (!config.dir.prisma ) {
        throw Error('Error: please set "dir.prisma" in  madarina.json file')
    }
    if (!config.dir.generated ) {
        throw Error('Error: please set "dir.generated" in  madarina.json file')
    }
    return (config)
}

const walkSync = function (dir: string, fileList: string[]) {
    const files = fs.readdirSync(dir);
    fileList = fileList || [];
    files.forEach(function (file) {
        const pathFile = path.join(dir, file)
        if (fs.statSync(pathFile).isDirectory()) {
            fileList = walkSync(pathFile, fileList);
        } else {
            if (path.extname(file) === '.js') fileList.push(pathFile);
        }
    });
    return fileList;
};

export interface ConfigInterface {
    prisma:{
        port:string,
        host: string,
    }
    dir: ConfigDirInterface
    options?: {
        auth?: boolean
    }
    secret: string

}

export interface ConfigDirInterface {
    schemas: string[]
    tables?: string[]
    actions?: string[]
    prisma: string
}

export const loadSchemas = (dir: ConfigDirInterface) => {
    let tables: string[] = []
    let schemas: string[] = []
    let actions: string[] = []
    dir.schemas.forEach((dir) => {
        schemas = walkSync(path.join(process.cwd(), dir), schemas)
    })
    if (dir.actions) {
        dir.actions.forEach((dir) => {
            actions = walkSync(path.join(process.cwd(), dir), actions)
        })
    }
    if (dir.tables) {
        dir.tables.forEach((dir) => {
            tables = walkSync(path.join(process.cwd(), dir), tables)
        })
    }

    schemas.forEach((schema) => {
        const content: string = fs.readFileSync(schema, 'utf8');
        if (true || content.match(/new *Schema/)) {
            console.log('loading schema: ', schema)
            require(schema)
        }
    })
    tables.forEach((table) => {
        const content: string = fs.readFileSync(table, 'utf8');
        if (true || content.match(/new *Table/)) {
            console.log('loading table: ', table)
            require(table)
        }
    })
    actions.forEach((action) => {
        const content: string = fs.readFileSync(action, 'utf8');
        if (true || content.match(/new *Table/)) {
            console.log('loading action: ', action)
            require(action)
        }
    })
}


