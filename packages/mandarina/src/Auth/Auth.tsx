import {Schema} from "..";
import React, {ElementType, ReactNode} from "react";

export type ActionType = 'create' | 'read' | 'update' | 'delete'

export interface AuthChildrenProps {
    fields: string[],
    readFields: string[],
    error: string,
    loading: boolean
}

export interface AuthProps {
    action: ActionType
    schema: Schema
    userRoles?: string[]
    fields: string[]
    children: (props: any) => ReactNode
}
export interface AuthElementsProps {
    denied?: ReactNode
    Error?: ElementType<{ error: string }>
    userRoles: string[]
    innerRef?: React.Ref<any>
}


const Auth = ({children, action, schema, userRoles, fields}: AuthProps) => {

    const finalFields = getFields({fields, action, schema, userRoles})

    const childrenProps: AuthChildrenProps = {fields: finalFields, loading: false, error: "", readFields: []}
    if (action === 'update') {
        childrenProps.readFields = getFields({fields, action: 'read', schema, userRoles})
    }
    return children(childrenProps)
}


export default Auth





export const actions = ['read', 'create', 'update', 'delete']


export const getFields = (args: AuthArgs) => {
    if (!actions.includes(args.action)) throw new Error(`Action only can be one of ['read', 'create', 'update', 'delete'] not: ${args.action} `)
    const finalFields: string[] = []
    args.fields.forEach(field => {
        if (!args.schema.hasPath(field)) {
            finalFields.push(field)
        } else if (args.schema.getFieldPermission(field, args.action, args.userRoles)) {
            finalFields.push(field)
        }
    })
    return finalFields
}


//export const staticPermissions = ['everybody', 'nobody', 'logged']


export interface AuthArgs {
    fields: string[]
    schema: Schema,
    action: ActionType,
    userRoles?: string[]
}


