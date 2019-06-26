import React, {PureComponent} from 'react'
import {Schema} from '..'
import gql from "graphql-tag";
import {Query, QueryProps, QueryResult} from "react-apollo";
import {buildQueryFromFields} from "./utils";
import pull from 'lodash.pull'
import {filterFields} from "../utils";

export type FindQueryResult = Pick<QueryResult, 'data' | 'loading' | 'error' | 'variables' | 'networkStatus' | 'refetch' | 'fetchMore' | 'startPolling' | 'stopPolling' | 'subscribeToMore' | 'updateQuery' | 'client'>

export interface FindChildrenParams extends FindQueryResult {
    schema: Schema
    fields: string[]
    query: Query
    count: number
    pageInfo?: {
        hasNextPage: boolean
        hasPreviousPage: boolean
        endCursor: string
        startCursor: string
    }

}

export interface FindChildren {
    (findChildrenParams: FindChildrenParams): React.ReactNode
}

export type FindQueryProps = Pick<QueryProps, 'pollInterval' | 'notifyOnNetworkStatusChange' | 'fetchPolicy' | 'errorPolicy' | 'ssr' | 'displayName' | 'onCompleted' | 'onError' | 'context' | 'partialRefetch'>


export interface FindProps extends FindQueryProps {
    children?: FindChildren
    schema: Schema
    fields?: string[]
    omitFields?: string[]
    omitFieldsRegEx?: RegExp
    skip?: number
    sort?: { [field: string]: -1 | 1 }
    where?: object
    after?: string
    first?: number
    //todo: crear un parametro para hacer el refrescamiento de los quieres **1
}

export interface FindBaseProps {
    type: 'single' | 'plural' | 'connection'
}

export interface FindBaseState {
    fields: string[]
}

export class FindBase extends PureComponent<FindProps & FindBaseProps, FindBaseState> {
    static defaultProps = {where: {}, first: 50}
    static queries: object[]
    queryHistory: object[] = []

    buildQueryFromFields = (fields: string[]) => buildQueryFromFields(fields)

    constructor(props: FindProps & FindBaseProps) {
        super(props)
        FindBase.queries = FindBase.queries || []
        //todo: **1
    }

    componentWillUnmount() {
        if (!Array.isArray(FindBase.queries)) return
        pull(FindBase.queries, ...this.queryHistory)
    }


    render() {

        const {
            fields: optionalFields, schema, after, first, type, where, skip, sort,
            omitFields,
            omitFieldsRegEx,
            children,
            pollInterval,
            notifyOnNetworkStatusChange,
            fetchPolicy,
            errorPolicy,
            ssr,
            displayName,
            onCompleted,
            onError,
            context,
            partialRefetch,
            ...props
        } = this.props;
        let fields = filterFields(schema.getFields(), optionalFields, omitFields, omitFieldsRegEx)
        let orderBy: undefined | string
        if (sort) {
            const field = Object.keys(sort)[0]
            orderBy = field + (sort[field] > 0 ? '_ASC' : '_DESC')
        }
        const {names} = schema
        const defaultQuery = this.buildQueryFromFields(fields)
        let queryString: string
        if (type === 'connection') {
            queryString = `query ($where: ${names.input.where[type]}, $after: String, $first: Int, $skip: Int, $orderBy: ${names.orderBy}) 
            { ${names.query[type]} (where: $where, after: $after, first: $first, skip: $skip, orderBy: $orderBy) {
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                  startCursor
                  endCursor
                }
                edges {
                  node  ${defaultQuery}
                }
              }
              totalCount: ${names.query[type]} (where: $where) {
                aggregate {
                  count
                }
              }    
            }`

        } else {
            queryString = `query ($where: ${names.input.where[type]} ) { ${names.query[type]}  (where: $where) ${defaultQuery} }`
        }
        const QUERY = gql(queryString)
        // save a rendered query history in the instance and in the class
        // for update cache queries on mutations
        const query = {[names.input[type]]: where}
        this.queryHistory.push(query)
        FindBase.queries.push(query) //save queries to update cache purposes
        const variables = {where, first, after, skip, orderBy}
        return (
            <Query
                query={QUERY}
                variables={variables}
                pollInterval={pollInterval}
                notifyOnNetworkStatusChange={notifyOnNetworkStatusChange}
                fetchPolicy={fetchPolicy}
                errorPolicy={errorPolicy}
                ssr={ssr}
                displayName={displayName}
                onCompleted={onCompleted}
                onError={onError}
                context={context}
                partialRefetch={partialRefetch}
            >
                {({
                      error,
                      data,
                      loading,
                      variables,
                      networkStatus,
                      refetch,
                      fetchMore,
                      startPolling,
                      stopPolling,
                      subscribeToMore,
                      updateQuery,
                      client,
                  }: QueryResult) => {
                    let count, pageInfo
                    if (!error) {
                        if (type === 'connection' && data && data[names.query[type]]) {
                            count = data[`totalCount`].aggregate.count
                            pageInfo = data[names.query[type]].pageInfo
                            data = data[names.query[type]].edges.map((data: any) => data.node)
                        } else {
                            data = data && data[names.query[type]]
                        }
                    }
                    if (!children) return null
                    return children({
                        schema,
                        query: QUERY,
                        data,
                        loading,
                        error,
                        variables,
                        networkStatus,
                        fields,
                        fetchMore,
                        count,
                        pageInfo,
                        refetch,
                        startPolling,
                        stopPolling,
                        subscribeToMore,
                        updateQuery,
                        client,
                        ...props,

                    })
                }}
            </Query>
        )
    }
}


export const FindOne = (props: FindProps) => <FindBase type='single' {...props}/>

export const Find = (props: FindProps) => <FindBase type='connection' {...props}/>

