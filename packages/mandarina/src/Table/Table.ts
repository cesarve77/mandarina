import {Schema, SchemaOptions, UserSchemaShape} from "../Schema/Schema";
import {
    buildInterfaceName,
    capitalize,
    getDeclarations,
    getGraphQLInput,
    getGraphQLModel,
    pluralize,
    singularize,
    sleep
} from "./utils";
import {isBrowser} from "browser-or-node";
import {Action, AuthArgs} from "../Auth/Auth";
import {Prisma} from "prisma-binding";

import {ContextParameters} from "graphql-yoga/dist/types";
import { InvalidActionError } from '../Errors/InvalidActionError';

const defaultPermissions = { read: {}, create: {}, update: {}, delete: {} };
const defaultActions = Object.keys(defaultPermissions);

/**
 *
 * A Table instance is the representation of the one of several of the followings:
 * Physic table in the data base
 * Form
 * List of results
 */
export class Table {
    /**
     * a Object with all table instances created
     */
    static instances: { [name: string]: Table }

    /**
     * Configure is a function which takes 1 params as a Object
     * @param get
     */
    static config: TableConfigDefault = {
        prismaDir: '/prisma',
        /**
         *
         * @param user
         */
        getUser: ({user}) => user,

    }
    static configure = (options: TableConfig): void => {
        if (options.prismaDir) Table.config.prismaDir = options.prismaDir
        if (options.getUser) Table.config.getUser = options.getUser
    }
    public schema: Schema
    public names: Names
    public name: string
    public path: string
    public options: TableSchemaOptions & TableShapeOptions
    private permissions: any;

    /**
     *
     * @param schema
     * @param tableOptions
     */
    constructor(schema: Schema | UserSchemaShape, tableOptions: TableSchemaOptions & TableShapeOptions) {
        this.path = this._getFilePath()
        this.schema = schema instanceof Schema ? schema : new Schema(schema, <TableShapeOptions>tableOptions)
        this.options = {resolvers: {}, ...schema.options, ...tableOptions}
        if (!this.options.virtual) {
            this.schema.extend({
                id: {
                    type: String,
                    permissions: {
                        read: this.schema.permissions.read,
                        create: 'nobody',
                        update: 'nobody',
                    }
                }
            })
        }
        this.name = tableOptions.name || this.schema.name
        let single = singularize(this.name)
        const singleUpper = capitalize(single)
        let plural = pluralize(this.name)
        const pluralUpper = capitalize(plural)
        const connection = `${plural}Connection`
        this.names = {
            query: {single, plural, connection},//user, users, usersConnection
            mutation: {
                create: `create${singleUpper}`,
                update: `update${singleUpper}`,
                delete: `delete${singleUpper}`,
                updateMany: `updateMany${pluralUpper}`,
                deleteMany: `deleteMany${pluralUpper}`
            },
            input: {
                where: {
                    single: `${singleUpper}WhereUniqueInput!`,
                    plural: `${singleUpper}WhereInput`,
                    connection: `${singleUpper}WhereInput`,
                },
                create: `${singleUpper}CreateInput!`,
                update: `${singleUpper}UpdateInput!`,
            }
        }
        Table.instances = Table.instances || {}
        if (Table.instances[this.name]) throw new Error(`Table named ${this.name} already exists, names should be uniques`)
        Table.instances[this.name] = this
    }

    static getInstance(name: string): Table {
        const instance = Table.instances[name]
        if (!instance) throw new Error(`No table named ${name}`)
        return instance
    }

    getFields() {
        return this.schema.getFields()
    }

    /**
     * Returns the resource schema appliying the authorization and data exposition policy
     *
     * @param action
     * @param role
     *
     * @return Schema
     */
    getSchema(action: string, role?: string | string[]) {

        const roles = Array.isArray(role) ? role : [role];

        if(!defaultActions.includes(action)){
            throw new InvalidActionError(action);
        }

        const fields = this.getFields();
        const permissionsByRole = this.getPermissions()[action];
        const allowedFieldsNames = Object.keys(permissionsByRole)
                                            .filter(k => roles.includes(k))
                                            .map(k => permissionsByRole[k])
                                            .reduce((p, c) => p.concat(c), permissionsByRole.everyone);

        return fields
                .filter((fieldName) => allowedFieldsNames.includes(fieldName))
                .reduce((res, fieldName) => ({...res, [fieldName]: this.schema.shape[fieldName] }), {});
    }

    /**
     * Returns the the authorization schema definition for the instance
     *
     * @return Permissions
     */
    getPermissions() {
        const fields = this.getFields();

        if(!this.permissions) {
            this.permissions = defaultPermissions;

            fields.forEach((field) => {
                const def = this.schema.getPathDefinition(field)

                defaultActions.forEach((action) => {
                    def.permissions = def.permissions || {}

                    if (!def.permissions[action]) {
                        this.permissions[action].everyone = this.permissions[action].everyone || []
                        this.permissions[action].everyone.push(field)
                        return
                    }

                    if (def.permissions[action] === 'nobody') return
                    const roles: string[] = def.permissions[action].split('|')
                    roles.forEach((role) => {
                        this.permissions[action][role] = this.permissions[action][role] || []
                        this.permissions[action][role].push(field)
                    })

                })
            });
        }

        return this.permissions;
    }

    getResolvers(type: operationType) {
        const resolvers = this.options.resolvers || {}
        let result = {}
        Object.keys(resolvers).forEach((key) => {
            if (resolvers[key].type === type) result[key] = resolvers[key].resolver;
        })
        return result
    }

    getDefaultResolvers(type: operationType) {
        if (isBrowser) throw new Error('getDefaultResolvers is not available on browser')
        /* SEVER-START */
        if (this.schema.options.virtual) {
            return this.getResolvers(type)
        }
        const result = {}
        const operationNames: string[] = Object.values(this.names[type]) //operationName for query is user or users, for mutation are createUser, updateUser ....
        const {onBefore, onAfter} = this.options
        operationNames.forEach((operationName: string) => {
            result[operationName] = async (_: any, args: any = {}, context: Context, info: any) => {
                const subOperationName: Action | string=operationName.substr(0,6)
                const action: Action=<Action>(['create','update','delete'].includes(subOperationName) ? subOperationName : 'read')
                const user = await Promise.resolve(Table.config.getUser(context));

                // TODO: deletion
                console.log(user);

                //const fields = Object.keys(flatten({[this.name]: graphqlFields(info)}))
                //if (type === 'mutation') this.validate(args.data,fields)
                //const userId = Table.config.getUserId(context)
                //const restrictionQuery = await this.checkPermissionsTable({type, operationName, userId})
                //await this.checkPermissionsFields({type, operationName, info, userId})
                //if (restrictionQuery) {
                //    let query = args.where || {}
                //    args.where = {AND: [query, restrictionQuery]}
                //}

                onBefore && await onBefore(action, _, args, context, info)
                const result = await context.prisma[type][operationName](args, info)
                context.result = result
                onAfter && onAfter(action, _, args, context, info)

                // TODO: remove in production
                await sleep(400)
                return result
            }
        })
        return result
        /* SEVER-END */
    }

    getGraphQLModel() {
        return getGraphQLModel(this.schema, this.schema.name)
    }

    getGraphQLInput() {
        return getGraphQLInput(this.schema, this.schema.name)
    }

    // string with virtual schemas
    getGraphQLOperations() {
        let response = ''
        const resolvers = this.options.resolvers
        if (resolvers) {
            Object.keys(resolvers).forEach((resolverName: string) => {
                const resolver = resolvers[resolverName]
                response += `extend type ${capitalize(resolver.type)} {\n\t${resolverName}(data: ${capitalize(resolverName)}Input!): ${resolver.result}\n}`
            })
        }
        return response
    }

    saveDeclarationFiles(): Table {
        const fs = require('fs')
        const path = require('path')
        fs.writeFileSync(path.join(this.path, buildInterfaceName(this.name)) + '.ts', getDeclarations(this))
        return this

    }

    saveFiles(): Table {
        //if (isBrowser) throw new Error('getGraphQLSchema is not available on browser')
        const fs = require('fs')
        const path = require('path')
        const yaml = require('node-yaml')
        const prismaDir = Table.config.prismaDir
        const prismaYaml = `${prismaDir}/prisma.yml`
        if (Object.keys(Table.instances).length === 0) {
            const prisma: { datamodel: string[] } = yaml.readSync(prismaYaml) || {}
            prisma.datamodel = []
            yaml.writeSync(prismaYaml, prisma)
            const datamodelDir = path.join(prismaDir, 'datamodel')
            fs.readdirSync(datamodelDir).forEach((file: string) => {
                fs.unlinkSync(path.join(datamodelDir, file));
            })
        }
        const fileName = this.name.toLowerCase()

        const operations = this.getGraphQLOperations()
        if (operations) {
            const fileAbsInput = `${prismaDir}/datamodel/${fileName}.input.graphql`
            const fileAbsOperations = `${prismaDir}/datamodel/${fileName}.operations.graphql`
            fs.writeFileSync(fileAbsOperations, operations)
            fs.writeFileSync(fileAbsInput, this.getGraphQLInput())
        }
        if (this.options.virtual) return this
        const model = this.getGraphQLModel()
        if (model) {
            if (!fs.existsSync(`${prismaDir}/datamodel`)){
                fs.mkdirSync(`${prismaDir}/datamodel`);
            }
            const fileAbsModel = `${prismaDir}/datamodel/${fileName}.model.graphql`
            const fileRelModel = `datamodel/${fileName}.model.graphql`
            fs.writeFileSync(fileAbsModel, model)
            const prisma: { datamodel: string[] | string } = yaml.readSync(prismaYaml) || {}
            prisma.datamodel = prisma.datamodel || []
            if (!Array.isArray(prisma.datamodel)) prisma.datamodel = [prisma.datamodel]
            if (!prisma.datamodel.includes(fileRelModel)) prisma.datamodel.push(fileRelModel)
            yaml.writeSync(prismaYaml, prisma)
        }

        return this
    }

    //}
    register() {

    }

    private _getFilePath() {
        /* SEVER-START */
        const origPrepareStackTrace = Error.prepareStackTrace
        Error.prepareStackTrace = function (_, stack) {
            return stack
        }
        const err = new Error()
        const stack = err.stack
        Error.prepareStackTrace = origPrepareStackTrace
        const path = require('path')
        // @ts-ignore
        return path.dirname(stack[2].getFileName())
        /* SERVER-END */
    }

    //private checkPermissionsFields(param: { type: string; operationName: string; info: any; userId: string }) {

    //  }

    // private checkPermissionsTable(param: { type: string; operationName: string; userId: string }) {


}

export interface Context extends ContextParameters {
    prisma: Prisma
    [others: string]: any
}

export interface ContextAfter<Result> extends ContextParameters {
    result: Result
}

type getUser = (context: Context) => Promise<User | null | undefined> | User | null | undefined

export interface TableConfig {
    getUser?: getUser
    prismaDir: string
}

type User = {
    id: string
    roles: string[]
    [otherProperties: string]: any
}

export interface TableConfigDefault {
    getUser: getUser
    prismaDir: string
}


export type Permission = 'everyone' | 'nobody' | string

export interface Permissions {
    read?: Permission
    create?: Permission
    update?: Permission
    delete?: Permission
    filter?: (this: any, user: { userId: string, roles: string[] }, args: AuthArgs) => Promise<Object> | Object | undefined
}

export interface Hook {
    (action: Action, _: any, args: any, context: any, info: any): Promise<any> | void | any
}

export type operationType = "mutation" | "query"

export interface ResolversInterface {
    [name: string]: {
        permissions?: Permission
        resolver: (_: any, args: any, context: any, info: any) => any | Promise<any>
        fields?: string[] | {
            [field: string]: Permission
        }
        type: operationType
        result: string
    }
}

export interface TableSchemaOptions {
    virtual?: boolean
    onBefore?: Hook
    onAfter?: Hook
    resolvers?: ResolversInterface
}

export interface TableShapeOptions extends SchemaOptions, TableSchemaOptions {
}

export interface Names {
    query: { single: string, plural: string, connection: string },//user, users, usersConnection
    mutation: {
        create: string,
        update: string,
        delete: string,
        updateMany: string,
        deleteMany: string
    },
    input: {
        where: {
            single: string,
            plural: string,
            connection: string,
        },
        create: string,
        update: string,
    }
}
