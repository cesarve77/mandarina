import {Table} from "..";
import {Mandarina} from "../Mandarina";
import {ActionType, addToSet} from "./Auth";


interface AuthInterface {
    getRoles: (args?: { table: string, action: string, role?: string }) => string[]
    resolvers: {
        AuthFields: (_: any, args: any, context: any, info: any) => Promise<string[] | undefined>
    }
    reset: () => void
    saveFiles: () => void
}


let roles: string[] = []
let authFields: {
    [tableName: string]: {
        [action in ActionType]: {
            [role: string]: string[]
        }
    }
} = {}


export const actions = ['read', 'create', 'update', 'delete']

export const AuthServer: AuthInterface = {
    reset: () => {
        roles = []
        authFields = {}
    },
    getRoles: () => {
        if (roles.length === 0) {

            const tables = Object.values(Table.instances)
            tables.forEach((table: Table) => {
                authFields[table.name] = authFields[table.name] || {read: {}, create: {}, update: {}, delete: {}}
                const permissions = table.getPermissions()
                actions.forEach((action) => {
                    const tableRoles = Object.keys(permissions[action])
                    tableRoles.forEach(role => {
                        authFields[table.name][action][role] = permissions[action][role]
                        if (role && !roles.includes(role)) {
                            roles.push(role)
                        }
                    })

                })
            })
        }
        return roles
    },
    resolvers: {
        AuthFields: async (_: any, args: AuthArgs, context: any, info: any) => {
            const allRoles = AuthServer.getRoles()
            const user = await Mandarina.config.getUser(context)

            const userRoles = (user && user.roles) || []
            if (!actions.includes(args.action)) throw new Error(`Action only can be one of ['read', 'create', 'update', 'delete'] now is: ${args.action} `)
            if (!authFields[args.table]) throw new Error(`Table ${args.table} not found getting AuthFields `)
            const table = Table.getInstance(args.table)
            const allTableFields=table.getFields()
            const tablePermissions = table.getPermissions()
            const everyone = tablePermissions[args.action].everyone
            let fields: string[] = everyone ? everyone : []
            let extraRoles: string[] = []

            userRoles.forEach((role) => {
                if (allRoles.includes(role)) {
                    addToSet(fields, authFields[args.table][args.action][role] || [])
                } else {
                    extraRoles.push(role)
                }
            })
            if (!extraRoles.length) return allTableFields.filter(field=>fields.includes(field)) // for keep the order
            const alcFields = await context.prisma.query.authTables({
                where: {
                    role_in: userRoles,
                    table: args.table,
                    action: args.action,
                }
            })
            addToSet(fields, alcFields)

            return allTableFields.filter(field=>fields.includes(field)) // for keep the order
            /*const staticRoles = roles.filter(permissionRoles.includes)
            const dynamicRoles = roles.filter((field: string) => !permissionRoles.includes(field))


            const table = Table.getInstance(args.table)
            const permissions = table.options.permissions
            const userId = Table.config.getUserId(context)

            if (permissions && permissions[args.action]) {
                if (permissions[args.action] === 'everyone') return table.schema.getFields()
                if (permissions[args.action] === 'nobody') return null
                if (permissions[args.action] === 'logged' && userId) return table.schema.getFields()
                const permissionRoles = permissions[args.action].split('|')


                const result: string[] = []
                if (staticRoles.length) {

                }
                if (dynamicRoles.length) {
                    const response = await context.prisma.query.authTables({
                        where: {
                            role_in: userRoles,
                            table: args.table,
                            action: args.action,
                        }
                    })
                    const fields = response && response.data && response.data.authTables
                    if (fields) return result.concat(fields)
                }
                return result.length ? result : null
            }
            return table.schema.getFields()*/
        }


    },
    saveFiles: () => { //todo unify with Table save files
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
        const fs = require('fs')
        const yaml = require('node-yaml')
        const prismaDir = Mandarina.config.prismaDir
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
}


//export const staticPermissions = ['everyone', 'nobody', 'logged']


export interface AuthArgs {
    table: string,
    action: ActionType,
    id?: string
}


