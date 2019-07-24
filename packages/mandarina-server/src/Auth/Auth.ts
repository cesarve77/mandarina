import Mandarina from "../Mandarina";
import {ActionType, addToSet, getFields, getRoles} from "mandarina/build/Auth/Auth";
import {Schema} from "mandarina";

interface AuthInterface {
    getRoles: () => Set<string>
    resolvers: {
        AuthFields: (_: any, args: any, context: any, info: any) => Promise<string[] | undefined>
    }
}


export const actions = ['read', 'create', 'update', 'delete']

export const Auth: AuthInterface = {
    getRoles,
    resolvers: {
        AuthFields: async (_: any, {action, table, fields}: AuthArgs, context: any, info: any) => {
            const allRoles = Auth.getRoles()
            const user = await Mandarina.config.getUser(context)

            const userRoles: string[] = (user && user.roles) || []
            const schema = Schema.getInstance(table)
            const finalFields = new Set(getFields({userRoles, schema, action, fields}) || [])
            let tableRoles: Set<string> = new Set()
            let extraRoles: Set<string> = new Set()

            userRoles.forEach((role) => {
                if (allRoles.has(role)) {
                    tableRoles.add(role)
                } else {
                    extraRoles.add(role)
                }
            })
            if (extraRoles.size === 0) return fields.filter(field => finalFields.has(field)) // for keep the order

            const alcFields = await context.prisma.query.authTables({
                where: {
                    role_in: userRoles,
                    table,
                    action,
                }
            })
            // TODO esto no funciuona
            addToSet(fields, alcFields)

            return fields.filter(field => fields.includes(field)) // for keep the order
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

}


//export const staticPermissions = ['everyone', 'nobody', 'logged']


export interface AuthArgs {
    table: string,
    fields: string[],
    action: ActionType,
    id?: string
}


