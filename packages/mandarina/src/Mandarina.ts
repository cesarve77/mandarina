import fs from "fs";
import path from "path";
import yaml from "node-yaml";
import {getParents} from "./utils";
import {capitalize, getGraphQLInput, getGraphQLModel} from "./Table/utils";
import {Context, Table} from "./Table/Table";
import {Schema} from "./Schema/Schema";
import {CustomAction} from "./Operations/CustomAction";

export class Mandarina {
    static config: MandarinaConfigDefault = {
        prismaDir: '/prisma',
        getUser: ({user}) => user,

    }
    private static processed: { [tableName: string]: true } = {}

    static configure = (options: MandarinaConfigOptions) => {
        if (options.prismaDir) {
            Mandarina.config.prismaDir = options.prismaDir;
        }

        if (options.getUser) {
            Mandarina.config.getUser = options.getUser;
        }
    }

// string with virtual schemas
    static getGraphQLOperations(schema: Schema) {
        let response = '';
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


    static reset() {
        const prismaDir = Mandarina.config.prismaDir;
        const prismaYaml = `${prismaDir}/prisma.yml`;
        const prisma: { datamodel: string[] } = yaml.readSync(prismaYaml) || {};
        prisma.datamodel = [];
        yaml.writeSync(prismaYaml, prisma);
        const datamodelDir = path.join(prismaDir, 'datamodel');
        fs.readdirSync(datamodelDir).forEach((file: string) => fs.unlinkSync(path.join(datamodelDir, file)));

    }

    static saveSubSchemas(schema: Schema) {
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
            if (subSchema && !Mandarina.processed[subSchema]) {
                const schema = Schema.getInstance(subSchema)
                Mandarina.saveFile(schema)
                Mandarina.saveSubSchemas(schema)
            }
        })
    }

    static saveFiles() {
        Mandarina.processed = {}
        Mandarina.reset()
        for (const tableName in Table.instances) {
            const table = Table.getInstance(tableName)
            Mandarina.saveFile(table.schema)
            Mandarina.saveSubSchemas(table.schema)
        }
        for (const actionName in CustomAction.instances) {
            const action = CustomAction.getInstance(actionName)
            if (action.schema) {

                Mandarina.saveFile(action.schema)
            } else {
                Mandarina.saveActionSchema(action.name)

            }
        }
    }

    static saveActionSchema(name: string) {
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
        const prismaDir = Mandarina.config.prismaDir;
        const fileAbsOperations = `${prismaDir}/datamodel/${fileName}.operations.graphql`;
        fs.writeFileSync(fileAbsOperations, operations);
    }

    static saveFile(schema: Schema) {
        if (Mandarina.processed[schema.name]) return
        Mandarina.processed[schema.name] = true
        const prismaDir = Mandarina.config.prismaDir;
        const prismaYaml = `${prismaDir}/prisma.yml`;


        const fileName = schema.name.toLowerCase();
        const operations = this.getGraphQLOperations(schema);
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

        return this;
    }

    static getQuery() {
        let Query = {}
        for (const tableName in Table.instances) {
            const table = Table.getInstance(tableName)
            Query = {...Query, ...table.getDefaultActions('query')}
        }
        for (const actionName in CustomAction.instances) {
            const action = CustomAction.getInstance(actionName)
            Query = {...Query, ...action.getActions('query')}
        }
        return Query
    }

    static getMutation() {
        let Mutation = {}
        for (const tableName in Table.instances) {
            const table = Table.getInstance(tableName)
            Mutation = {...Mutation, ...table.getDefaultActions('mutation')}
        }
        for (const actionName in CustomAction.instances) {
            const action = CustomAction.getInstance(actionName)
            Mutation = {...Mutation, ...action.getActions('mutation')}
        }
        return Mutation
    }
}

type getUser = (context: Context) => Promise<UserType | null | undefined> | UserType | null | undefined

export interface MandarinaConfigOptions {
    getUser?: getUser
    prismaDir: string
}

export interface MandarinaConfigDefault extends MandarinaConfigOptions {
    getUser: getUser
}

export type UserType = {
    id: string
    roles: string[]
    [otherProperties: string]: any
}
