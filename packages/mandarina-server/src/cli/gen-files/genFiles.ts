import {getConfig, loadSchemas} from "../utils";
import {Schema} from "mandarina";
import {
    createDir,
    getAuthOperation,
    getGraphQLInput,
    getGraphQLModel,
    getGraphQLOperation,
    getSubSchemas,
    resetDir,
    saveDockerComposeYaml,
    saveFile,
    savePrismaYaml
} from "./genFilesUtils";
import {CustomAction} from "../../Action/CustomAction";
import {Table} from "../..";


export const genFile = () => {
    const config = getConfig()
    loadSchemas(config.dir)
    createDir(config.dir.prisma)
    resetDir(config.dir.prisma)
    const models: Set<string> = new Set()
    let processedSubSchemas: string[]=[]
    for (const schemaName in Table.instances) {
        const schema = Schema.getInstance(schemaName)
        const fileName = schema.name.toLowerCase()
        const graphql = getGraphQLModel(schema)
        saveFile(config.dir.prisma, fileName, graphql, 'model',)
        models.add(`datamodel/${fileName}.model.graphql`)
        const subSchemas = getSubSchemas(schema)
        for (const subsSchema of subSchemas) {
            if (processedSubSchemas.includes(subsSchema)) {
                continue;
            }
            processedSubSchemas.push(schemaName)
            const schema = Schema.getInstance(subsSchema)
            const graphql = getGraphQLModel(schema)
            const fileName = getFileName(schema)
            models.add(`datamodel/${fileName}.model.graphql`)
            saveFile(config.dir.prisma, fileName, graphql, 'model',)
        }

    }
    const database = config.prisma.database || 'default'
    const stage = config.prisma.stage || 'default'
    savePrismaYaml(models, config.dir.prisma, `${config.prisma.host}:${config.prisma.port}/${database}/${stage}`, config.secret)
    saveDockerComposeYaml(config.dir.prisma, config.prisma.port)

    processedSubSchemas=[]
    for (const schemaName in CustomAction.instances) {
        const fileName = schemaName.toLowerCase()
        const action = CustomAction.getInstance(schemaName)
        const schema = Schema.instances[schemaName]
        const operation = getGraphQLOperation(action, schema)
        saveFile(config.dir.prisma, fileName, operation, 'operation')
        if (!schema) continue
        const graphql = getGraphQLInput(schema)
        saveFile(config.dir.prisma, fileName, graphql, 'input',)
        const subSchemas = getSubSchemas(schema)
        for (const subsSchema of subSchemas) {
            if (processedSubSchemas.includes(subsSchema)) continue;
            processedSubSchemas.push(schemaName)
            const schema = Schema.getInstance(subsSchema)
            const graphql = getGraphQLInput(schema)
            const fileName = getFileName(schema)
            saveFile(config.dir.prisma, fileName, graphql, 'input',)
        }
    }
    if (config.options && config.options.auth) {
        const authOperation = getAuthOperation()
        saveFile(config.dir.prisma, 'mandarinaauth', authOperation, 'operation',)
    }
}

const getFileName = (schema: Schema) => schema.name.toLowerCase()