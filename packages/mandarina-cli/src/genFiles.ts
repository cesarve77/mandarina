import fs from "fs";
import path from "path";
import {getParents} from "mandarina/build/utils";
import {capitalize, getGraphQLInput, getGraphQLModel} from "mandarina/build/Table/utils";
import {Table,CustomAction, Schema} from "mandarina";
import {getConfig, loadSchemas} from "./utils";

const yaml: any = require("node-yaml")
const config = getConfig()

let processed: { [tableName: string]: true } = {}

const getGraphQLOperations = (schema: Schema) => {
    let response = '';
    CustomAction.instances = CustomAction.instances || {}
    const action = CustomAction.instances[schema.name]
    if (!action) return response
    const actions = action.actions;
    if (actions) {
        Object.keys(actions).forEach((actionName: string) => {
            const action = actions[actionName];
            response += `extend type ${capitalize(action.type)} {\n\t${actionName}(data: ${capitalize(actionName)}Input!): ${action.result}\n}`;
        })
    }
    return response;
}

const reset = () => {
    if (!config) return
    const prismaDir = path.join(process.cwd(), config.dir.prisma)
    const prismaYaml = path.join(prismaDir, `prisma.yml`)

    const prisma: { datamodel: string[], secret: string } = yaml.readSync(prismaYaml) || {};
    prisma.secret = config.secret
    prisma.datamodel = [];
    yaml.writeSync(prismaYaml, prisma);
    const datamodelDir = path.join(prismaDir, 'datamodel');
    fs.readdirSync(datamodelDir).forEach((file: string) => fs.unlinkSync(path.join(datamodelDir, file)));
}

const saveSubSchemas = (schema: Schema) => {
    const parents = getParents(schema.getFields())
    parents.forEach((field) => {
        const fieldDefinition = schema.getPathDefinition(field)
        let subSchema = ''
        if (typeof fieldDefinition.type === 'string') {
            subSchema = fieldDefinition.type
        }
        if (Array.isArray(fieldDefinition.type) && typeof fieldDefinition.type[0] === 'string') {
            subSchema = <string>fieldDefinition.type[0]
        }
        if (subSchema && !processed[subSchema]) {
            const schema = Schema.getInstance(subSchema)
            saveFile(schema)
            saveSubSchemas(schema)
        }
    })
}


const saveActionSchema = (name: string) => {
    if (!config) return
    const prismaDir = path.join(process.cwd(), config.dir.prisma)
    const action = CustomAction.getInstance(name)
    let operations = '';
    const actions = action.actions;
    if (actions) {
        Object.keys(actions).forEach((actionName: string) => {
            const action = actions[actionName];
            operations += `extend type ${capitalize(action.type)} {\n\t${actionName}: ${action.result}\n}`;
        })
    }
    const fileName = action.name.toLowerCase();
    const fileAbsOperations = `${prismaDir}/datamodel/${fileName}.operations.graphql`;
    fs.writeFileSync(fileAbsOperations, operations);
}

const saveFile = (schema: Schema) => {
    if (!config) return
    const prismaDir = path.join(process.cwd(), config.dir.prisma)
    if (processed[schema.name]) return
    processed[schema.name] = true
    const prismaYaml = `${prismaDir}/prisma.yml`;


    const fileName = schema.name.toLowerCase();
    const operations = getGraphQLOperations(schema);
    if (operations) {
        const fileAbsInput = `${prismaDir}/datamodel/${fileName}.input.graphql`;
        const fileAbsOperations = `${prismaDir}/datamodel/${fileName}.operations.graphql`;
        fs.writeFileSync(fileAbsOperations, operations);
        fs.writeFileSync(fileAbsInput, getGraphQLInput(schema));
    }


    const model = getGraphQLModel(schema)
    if (model) {
        if (!fs.existsSync(`${prismaDir}/datamodel`)) {
            fs.mkdirSync(`${prismaDir}/datamodel`);
        }

        const fileAbsModel = `${prismaDir}/datamodel/${fileName}.model.graphql`;
        const fileRelModel = `datamodel/${fileName}.model.graphql`;
        fs.writeFileSync(fileAbsModel, model);
        const prisma: { datamodel: string[] | string } = yaml.readSync(prismaYaml) || {};
        prisma.datamodel = prisma.datamodel || [];

        if (!Array.isArray(prisma.datamodel)) {
            prisma.datamodel = [prisma.datamodel];
        }

        if (!prisma.datamodel.includes(fileRelModel)) {
            prisma.datamodel.push(fileRelModel);
        }

        yaml.writeSync(prismaYaml, prisma);
    }

}


export const genFiles = () => {
    if (!config) return
    loadSchemas(config.dir)
    processed = {}
    reset()
    console.log('Table.instances',Table.instances)
    for (const tableName in Table.instances) {
        const table = Table.getInstance(tableName)
        saveFile(table.schema)
        saveSubSchemas(table.schema)
    }
    for (const actionName in CustomAction.instances) {
        const action = CustomAction.getInstance(actionName)
        if (action.schema) {
            saveFile(action.schema)
        } else {
            saveActionSchema(action.name)
        }
    }
    if (config.options && config.options.auth){
        saveAuthFiles()
    }
}


const saveAuthFiles=() => { //todo unify with Table save files
    if (!config) return
    const model = `type AuthTable {
                        role: String!
                        table: String!
                        action: String!
                        field: String
                        id: ID! @unique
                  }`
    const operation = `extend type Query {
                            AuthFields(action: String!, table: String!) :  [String!]
                       }`
    const prismaDir = config.dir.prisma
    const fileName = 'mandarina.auth'
    const fileAbsOperation = `${prismaDir}/datamodel/${fileName}.operations.graphql`
    const fileAbsModel = `${prismaDir}/datamodel/${fileName}.model.graphql`
    const fileRelModel = `datamodel/${fileName}.model.graphql`
    fs.writeFileSync(fileAbsModel, model)
    fs.writeFileSync(fileAbsOperation, operation)
    const prismaYaml = `${prismaDir}/prisma.yml`
    const prisma: { datamodel: string[] | string } = yaml.readSync(prismaYaml) || {}
    prisma.datamodel = prisma.datamodel || []
    if (!Array.isArray(prisma.datamodel)) prisma.datamodel = [prisma.datamodel]
    if (!prisma.datamodel.includes(fileRelModel)) prisma.datamodel.push(fileRelModel)
    yaml.writeSync(prismaYaml, prisma)
}