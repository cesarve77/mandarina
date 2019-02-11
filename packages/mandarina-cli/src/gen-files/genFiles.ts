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
    savePrismaYaml
} from "./genFilesUtils";
import {CustomAction} from "mandarina-server";


export const genFile_s = () => {
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
    savePrismaYaml(models, config.dir.prisma, config.secret)
    for (const schemaName in CustomAction.instances) {
        if (!Schema.instances[schemaName]) continue
        const schema = Schema.getInstance(schemaName)
        const fileName = schema.name.toLowerCase()
        const graphql = getGraphQLInput(schema)
        saveFile(config.dir.prisma, fileName, graphql, 'input',)

        const operation = getGraphQLOperation(CustomAction.getInstance(schemaName))
        saveFile(config.dir.prisma, fileName, operation, 'operation',)

        const subSchemas = getSubSchemas(schema)
        subSchemas.forEach((subsSchema) => {
            const schema = Schema.getInstance(subsSchema)
            const graphql = getGraphQLInput(schema)
            saveFile(config.dir.prisma, fileName, graphql, 'input',)
        })

    }
    if (config.options && config.options.auth){
        const authOperation=getAuthOperation()
        saveFile(config.dir.prisma, 'mandarinaauth', authOperation, 'model',)
    }
}