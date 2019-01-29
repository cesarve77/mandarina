import fs from "fs";
import path from "path";

export const getConfig = (): ConfigInterface | void => {
    let rawData
    try {
        rawData = fs.readFileSync(path.join(process.cwd(), 'mandarina.json'), 'utf8')
    } catch (e) {
        console.error('Error: Be sure you are in a mandarina project and has a madarina.json file')
        return
    }
    const config = JSON.parse(rawData)
    if (!config.secret) {
        console.error('Error: please set "secret" in  madarina.json file')
        return
    }
    if (!config.dir) {
        console.error('Error: please set "dir" in  madarina.json file')
        return
    }
    if (!config.dir.schemas || !Array.isArray(config.dir.schemas) || config.dir.schemas.length === 0) {
        console.error('Error: please set "dir.schemas" in  madarina.json file. Make sure it is a array')
        return
    }
    if (config.dir.tables && !Array.isArray(config.dir.tables)) {
        console.error('Error: please make sure "dir.tables" is a array')
    }
    if (!config.dir.prisma ) {
        console.error('Error: please set "dir.prisma" in  madarina.json file')
        return
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
    dir: ConfigDirInterface
    options?: {
        auth?: boolean
    }
    secret: string

}

export interface ConfigDirInterface {
    schemas: string[]
    tables?: string[]
    prisma: string
}

export const loadSchemas = (dir: ConfigDirInterface) => {
    let tables: string[] = []
    let schemas: string[] = []
    dir.schemas.forEach((dir) => {
        schemas = walkSync(path.join(process.cwd(), dir), schemas)
    })
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
}