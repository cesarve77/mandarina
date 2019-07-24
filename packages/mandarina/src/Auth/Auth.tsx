import {Component, ReactNode} from "react"
import {Schema} from "..";
import {withApollo, WithApolloClient} from "react-apollo";
import gql from "graphql-tag";
import {ApolloQueryResult} from "apollo-client";

export type ActionType = 'create' | 'read' | 'update' | 'delete'

export interface AuthChildrenProps {
    fields: string[],
    error?: Error,
    loading: boolean
}

export interface AuthProps {
    action: ActionType
    schema: Schema
    userRoles: string[]
    fields: string[]
    children: ({fields, error, loading}: AuthChildrenProps) => ReactNode
}

type AuthPropsWithClient = WithApolloClient<AuthProps>

class Auth extends Component<AuthPropsWithClient, { loading: boolean, fields: string[], error?: Error }> {
    constructor(props: AuthPropsWithClient) {
        super(props)
        let {action, schema, userRoles, fields} = props;
        const finalFields = getFields({fields, action, schema, userRoles})
        if (finalFields === null) {
            this.state = {loading: true, fields: []}
        } else {
            this.state = {loading: false, fields: finalFields}
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
        let {children, fields: hardCodeFields} = this.props;
        const {loading, fields: schemaFields, error} = this.state
        console.log('hardCodeFields',hardCodeFields)
        console.log('schemaFields',schemaFields)
        const fields = hardCodeFields.filter(field => schemaFields.includes(field))
        console.log('fields',fields)
        return children({fields, loading, error})
    }
}


export default withApollo<AuthProps>(Auth)


export const addToSet = (into: any[], toBeAdded: any[]) => toBeAdded.forEach(item => !into.includes(item) && into.push(item))


let roles=new Set<string>()
export let authFields: {
    [tableName: string]: {
        [action in ActionType]: {
            [role: string]: string[]
        }
    }
} = {}


export const actions = ['read', 'create', 'update', 'delete']


export const getRoles = () => {
    if (roles.size === 0) {
        const schemas = Object.values(Schema.instances)
        schemas.forEach((schema: Schema) => {
            const fields = schema.getFields()
            fields.forEach(field => {
                const permissions = schema.getPathDefinition(field).permissions
                if (permissions.read) permissions.read.forEach(r=>roles.add(r))
                if (permissions.update) permissions.update.forEach(r=>roles.add(r))
                if (permissions.create) permissions.create.forEach(r=>roles.add(r))
                if (permissions.delete) permissions.delete.forEach(r=>roles.add(r))
            })
        })
    }
    return roles
}
export const getFields = (args: AuthArgs) => {
    const allRoles = getRoles()
    for (const userRole of args.userRoles) {
        if (!allRoles.has(userRole)) return null;
    }

    if (!actions.includes(args.action)) throw new Error(`Action only can be one of ['read', 'create', 'update', 'delete'] now is: ${args.action} `)
    const finalFields: string[]=[]
    const t=new Date().getTime()
    args.fields.forEach(field=>{
        if (args.schema.getFieldPermission(field,args.userRoles,args.action)) finalFields.push(field)

    })
    console.log('time',new Date().getTime()-t)
    return finalFields

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
    fields: string[]
    schema: Schema,
    action: ActionType,
    userRoles: string[]
}


