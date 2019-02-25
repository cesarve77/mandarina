import {getConfig, loadSchemas} from "../utils";
import {Schema} from "mandarina";
import {
    createDir, getAuthOperation,
    getGraphQLInput,
    getGraphQLModel,
    getGraphQLOperation,
    getSubSchemas,
    resetDir,
    saveFile,
    savePrismaYaml,
    saveDockerComposeYaml
} from "./genFilesUtils";
import {CustomAction} from "mandarina-server";


export const genFile = () => {
    const config = getConfig()
    loadSchemas(config.dir)
    createDir(config.dir.prisma)
    resetDir(config.dir.prisma)
    const models = []
    for (const schemaName in Schema.instances) {
        const schema = Schema.getInstance(schemaName)
        const fileName = schema.name.toLowerCase()
        const graphql = getGraphQLModel(schema)
        saveFile(config.dir.prisma, fileName, graphql, 'model',)
        models.push(`datamodel/${fileName}.model.graphql`)
    }
    savePrismaYaml(models, config.dir.prisma, config.secret, `${config.prisma.host}:${config.prisma.port}`)
    saveDockerComposeYaml(config.dir.prisma,config.prisma.port)
    for (const schemaName in CustomAction.instances) {
        const fileName = schemaName.toLowerCase()
        const action=CustomAction.getInstance(schemaName)
        const schema=Schema.instances[schemaName]
        const operation = getGraphQLOperation(action,schema)
        saveFile(config.dir.prisma, fileName, operation, 'operation')
        if (!schema) continue
        const graphql = getGraphQLInput(schema)
        saveFile(config.dir.prisma, fileName, graphql, 'input',)
        const subSchemas = getSubSchemas(schema)
        subSchemas.forEach((subsSchema) => {
            const schema = Schema.getInstance(subsSchema)
            const graphql = getGraphQLInput(schema)
            const fileName = getFileName(schema)
            saveFile(config.dir.prisma, fileName, graphql, 'input',)
        })
    }
    if (config.options && config.options.auth){
        const authOperation=getAuthOperation()
        saveFile(config.dir.prisma, 'mandarinaauth', authOperation, 'operation',)
    }
}

const getFileName=(schema: Schema)=> schema.name.toLowerCase()