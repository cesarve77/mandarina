import React from "react"
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {Schema} from "..";
import {filterFields} from "../utils";

export type ActionType = 'create' | 'read' | 'update' | 'delete'



interface AuthTableProps {
    action: ActionType,
    schema: Schema
    fields?: string[]
    omitFields?: string[]
    omitFieldsRegEx?: RegExp
    children: (props: any) => JSX.Element | JSX.Element
}


export const AuthTable = ({action, schema, children,fields: optionalFields,omitFields,omitFieldsRegEx, ...props}: AuthTableProps) => {
    const table = schema.name
    const QUERY = gql`query AuthFields($action: String!, $table:String!) {AuthFields(action: $action, table: $table) }`
    return (
        <Query query={QUERY} variables={{action, table}}>
            {({data, loading, ...queryProps}) => {
                const authFields = data && data.AuthFields
                const fields=authFields ? filterFields(authFields, optionalFields, omitFields, omitFieldsRegEx): undefined
                if (typeof children === 'function') return children({fields, loading, ...props})
                return React.cloneElement(children, {fields, loading, ...queryProps, ...props})
            }}
        </Query>
    )
}


export default AuthTable


export const addToSet = (into: any[], toBeAdded: any[]) => toBeAdded.forEach(item => !into.includes(item) && into.push(item))