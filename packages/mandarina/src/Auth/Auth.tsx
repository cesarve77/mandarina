import {Component, ReactNode} from "react"
import {Schema} from "..";
import {filterFields} from "../utils";
import {withApollo, WithApolloClient} from "react-apollo";
import gql from "graphql-tag";
import {ApolloQueryResult} from "apollo-client";

export type ActionType = 'create' | 'read' | 'update' | 'delete'

export interface AuthChildrenProps {
    fields?: string[],
    error?: Error,
    loading: boolean
}

interface AuthProps {
    action: ActionType
    schema: Schema
    userRoles: string[]
    fields?: string[]
    omitFields?: string[]
    omitFieldsRegEx?: RegExp
    children: ({fields, error, loading}: AuthChildrenProps) => ReactNode
}

type AuthPropsWithClient = WithApolloClient<AuthProps>

class Auth extends Component<AuthPropsWithClient, { loading: boolean, fields: string[], error?: Error }> {
    constructor(props: AuthPropsWithClient) {
        super(props)
        let {action, schema, userRoles} = props;
        const fields = getFields({action, schema, userRoles})
        if (fields === null) {
            this.state = {loading: true, fields: []}
        } else {
            this.state = {loading: false, fields}
        }
    }

    componentDidMount(): void {
        if (this.state.loading) {
            let {action, schema} = this.props;
            const QUERY = gql`query fields ($action: String!, $table:String!) {AuthFields(action: $action, table: $table) }`
            this.props.client.query({
                query: QUERY,
                variables: {action, table: schema.name}
            })
                .then(({data: {fields}}: ApolloQueryResult<{ fields: string[] }>) => {
                    this.setState({loading: false, fields})
                })
                .catch((error) => this.setState({loading: false, error}))
        }
    }

    render() {
        let {children, fields: optionalFields, omitFields, omitFieldsRegEx} = this.props;
        const {loading, fields: authFields, error} = this.state
        const fields = authFields ? filterFields(authFields, optionalFields, omitFields, omitFieldsRegEx) : undefined
        return children({fields, loading, error})
    }
}


export default withApollo<AuthProps>(Auth)


export const addToSet = (into: any[], toBeAdded: any[]) => toBeAdded.forEach(item => !into.includes(item) && into.push(item))


let roles: string[] = []
export let authFields: {
    [tableName: string]: {
        [action in ActionType]: {
            [role: string]: string[]
        }
    }
} = {}


export const actions = ['read', 'create', 'update', 'delete']


export const getRoles = () => {
    if (roles.length === 0) {
        const schemas = Object.values(Schema.instances)
        schemas.forEach((schema: Schema) => {
            authFields[schema.name] = authFields[schema.name] || {read: {}, create: {}, update: {}, delete: {}}
            const permissions = schema.getPermissions()
            actions.forEach((action) => {
                const tableRoles = Object.keys(permissions[action])
                tableRoles.forEach(role => {
                    authFields[schema.name][action][role] = permissions[action][role]
                    if (role && !roles.includes(role)) {
                        roles.push(role)
                    }
                })

            })
        })
    }
    return roles
}
export const getFields = (args: AuthArgs) => {
    const allRoles = getRoles()
    if (!actions.includes(args.action)) throw new Error(`Action only can be one of ['read', 'create', 'update', 'delete'] now is: ${args.action} `)
    if (!authFields[args.schema.name]) throw new Error(`Table ${args.schema} not found getting AuthFields `)
    const allTableFields = args.schema.getFields()
    const tablePermissions = args.schema.getPermissions()
    const everyone = tablePermissions[args.action].everyone
    let fields: string[] = everyone ? everyone : []
    let extraRoles: string[] = []
    args.userRoles.forEach((role) => {
        if (allRoles.includes(role)) {
            addToSet(fields, authFields[args.schema.name][args.action][role] || [])
        } else {
            extraRoles.push(role)
        }
    })
    if (!extraRoles.length) return allTableFields.filter(field => fields.includes(field)) // for keep the order
    return null

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


//export const staticPermissions = ['everyone', 'nobody', 'logged']


export interface AuthArgs {
    schema: Schema,
    action: ActionType,
    userRoles: string[]
}


