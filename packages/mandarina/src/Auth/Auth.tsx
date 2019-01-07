import React from "react"
import gql from "graphql-tag";
import {Query, QueryResult} from "react-apollo";
import {Schema} from "..";

export type ActionType = 'create' | 'read' | 'update' | 'delete'

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type AuthQueryResult = Omit<QueryResult, 'data'> & { fields: string[] };


interface AuthTableProps {
    action: ActionType,
    schema: Schema | string
    children: (props: any) => JSX.Element | JSX.Element
}


export const AuthTable = ({action, schema, children, ...props}: AuthTableProps) => {
    const table = (schema instanceof Schema) ? schema.name : schema
    const QUERY = gql`query AuthFields($action: String!, $table:String!) {AuthFields(action: $action, table: $table) }`
    return (
        <Query query={QUERY} variables={{action, table}} >
            {({data, loading, ...queryProps}) => {
                const fields = data && data.AuthFields
                if (typeof children === 'function') return children({fields, loading, ...props})
                return React.cloneElement(children, {fields, loading, ...queryProps, ...props})
            }}
        </Query>
    )
}





export default AuthTable


export const addToSet = (into: any[], toBeAdded: any[]) => toBeAdded.forEach(item => !into.includes(item) && into.push(item))