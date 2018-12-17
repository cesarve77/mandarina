import React from "react"
import gql from "graphql-tag";
import {Query, QueryResult} from "react-apollo";
import {Table} from "..";

export type Action = 'create' | 'read' | 'update' | 'delete'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type AuthQueryResult = Omit<QueryResult, 'data'> & { fields: string[] };


interface AuthTableProps {
    action: Action,
    table: Table | string
    children: (props: any) => JSX.Element | JSX.Element
}

interface AuthTable {
    (authTableProps: AuthTableProps): JSX.Element

    getRoles: (args?: { table: string, action: string, role?: string }) => string[]
    resolvers: {
        AuthFields: (_: any, args: any, context: any, info: any) => Promise<string[] | null>
    }
    reset: () => void
    saveFiles: () => void
}

export const AuthTable: AuthTable = ({action, table, children, ...props}) => {
    if (table instanceof Table) table = table.name
    const QUERY = gql`query AuthFields($action: String!, $table:String!) {AuthFields(action: $action, table: $table) }`
    return (
        <Query query={QUERY} variables={{action, table}}>
            {({data, loading, ...queryProps}) => {
                const fields = data && data.AuthFields
                if (typeof children === 'function') return children({fields, loading, ...props})
                return React.cloneElement(children, {fields, loading, ...queryProps, ...props})
            }}
        </Query>
    )
}

let roles: string[] = []
let authFields: {
    [tableName: string]: {
        [action in Action]: {
            [role: string]: string[]
        }
    }
} = {}
export const actions = ['read', 'create', 'update', 'delete']
export const staticPermissions = ['everyone', 'nobody', 'logged']
AuthTable.reset = () => {
    roles = []
    authFields={}
}
AuthTable.getRoles = (args) => {
    if (!roles.length) {
        console.log(Object.keys(Table.instances))
        const tables = Object.values(Table.instances)
        tables.forEach((table: Table) => {
            authFields[table.name] = authFields[table.name] || {read: {}, create: {}, update: {}, delete: {},}
            const permissions = table.schema.permissions

            let tableRoles: string[] = []
            if (permissions) {
                actions.forEach((action) => {
                    const permission = permissions[action]
                    if (permission && !staticPermissions.includes(permission) && !roles.includes(permission)) {
                        permission.split('|').forEach((role: string) => roles.push(role))
                        tableRoles.push(permission)
                    }
                })
            }
            const fields = table.getFields()
            console.log(table.name, fields.length)
            fields.forEach((field) => {
                const def = table.schema.getPathDefinition(field)

                actions.forEach((action) => {
                    def.permissions = def.permissions || {}

                    if (!def.permissions[action]) {
                        authFields[table.name][action].everyone = authFields[table.name][action].everyone || []
                        authFields[table.name][action].everyone.push(field)

                        if (table.name === 'Family' && action === 'read') {
                            console.log('*******authFields[\'Family\'][\'read\'].everyone.length', authFields['Family']['read'].everyone.length)

                        }
                        return
                    }
                    if (def.permissions[action] === 'nobody') return
                    const roles: string[] = def.permissions[action].split('|')
                    roles.forEach((role) => {

                        authFields[table.name][action][role] = authFields[table.name][action][role] || []
                        authFields[table.name][action][role].push(field)

                    })

                })
            })
            console.log('tabletabletabletabletabletabletabletabletabletabletabletabletabletabletabletabletabletable', table.name)
        })
    }

    if (!args) return roles
    if (!args.role) return authFields[args.table][args.action]
    return authFields[args.table][args.action][args.role]
}

export interface AuthArgs {
    table: string,
    action: Action,
    id?: string
}

AuthTable.resolvers = {
    AuthFields: async (_: any, args: AuthArgs, context: any, info: any) => {
        const allRoles = AuthTable.getRoles()
        const user = await Table.config.getUser(context)
        const userRoles = (user && user.roles) || []
        if (!actions.includes(args.action)) throw new Error(`Action only can be one of ['read', 'create', 'update', 'delete'] now is: ${args.action} `)
        if (!authFields[args.table]) throw new Error(`Table ${args.table} not found getting AuthFields `)
        const everyone = authFields[args.table][args.action].everyone
        let fields: string[] = everyone ? everyone : []
        console.log('everyone', everyone.length)
        let extraRoles: string[] = []
        console.log('userRoles', userRoles)

        userRoles.forEach((role) => {
            if (allRoles.includes(role)) {
                console.log('role', role)
                addToSet(fields, authFields[args.table][args.action][role] || [])
            } else {
                extraRoles.push(role)
            }
        })
        console.log(userRoles, fields.length)
        if (!extraRoles.length) return fields
        const alcFields = await context.prisma.query.authTables({
            where: {
                role_in: userRoles,
                table: args.table,
                action: args.action,
            }
        })
        console.log('alcFields', alcFields)
        addToSet(fields, alcFields)
        return fields
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


}
AuthTable.saveFiles = () => { //todo unify with Table save files
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
    const prismaDir = Table.config.prismaDir
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


export default AuthTable


export const addToSet = (into: any[], toBeAdded: any[]) => toBeAdded.forEach(item => !into.includes(item) && into.push(item))