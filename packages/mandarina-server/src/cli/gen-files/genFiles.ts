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
import {CustomAction} from "../../Action/CustomAction";
import {Table} from "../..";
import {addToSet} from "mandarina/build/Auth/Auth";


export const genFile = () => {
    const config = getConfig()
    loadSchemas(config.dir)
    createDir(config.dir.prisma)
    resetDir(config.dir.prisma)
    const models:string[] = []
    for (const schemaName in Table.instances) {
        const schema = Schema.getInstance(schemaName)
        const fileName = schema.name.toLowerCase()
        const graphql = getGraphQLModel(schema)
        saveFile(config.dir.prisma, fileName, graphql, 'model',)
        addToSet(models,[`datamodel/${fileName}.model.graphql`])
        const subSchemas = getSubSchemas(schema)
        subSchemas.forEach((subsSchema) => {
            console.log('subSchemassubSchemassubSchemassubSchemas',subsSchema)

            const schema = Schema.getInstance(subsSchema)
            const graphql = getGraphQLModel(schema)
            const fileName = getFileName(schema)
            addToSet(models,[`datamodel/${fileName}.model.graphql`])
            saveFile(config.dir.prisma, fileName, graphql, 'model',)
        })

    }
    const database=config.prisma.database || 'default'
    const stage=config.prisma.stage|| 'default'
    savePrismaYaml(models, config.dir.prisma,`${config.prisma.host}:${config.prisma.port}/${database}/${stage}`, config.secret)
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