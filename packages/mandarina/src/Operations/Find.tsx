import React, {PureComponent} from 'react'
import {Table} from '../Table/Table'
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {buildQueryFromFields} from "./utils";
import pull from 'lodash.pull'
import {ApolloError, ErrorPolicy, FetchPolicy, NetworkStatus} from "apollo-client";
import {DocumentNode} from "graphql";
import ApolloClient from "apollo-client/ApolloClient";

type TVariables = { [key: string]: any }
type TData = any

export interface FindChildrenParams {
    table: Table
    data: object | object[]
    fields?: string[]
    loading: boolean
    error?: ApolloError
    variables: TVariables
    networkStatus: NetworkStatus
    refetch: (variables?: TVariables) => Promise<any>
    fetchMore: (args: { query?: DocumentNode, variables?: TVariables, updateQuery: Function }) => Promise<any>
    startPolling: (interval: number) => void
    stopPolling: () => void
    subscribeToMore: (options: { document: DocumentNode, variables?: TVariables, updateQuery?: Function, onError?: Function }) => () => void
    updateQuery: (previousResult: TData, options: { variables: TVariables }) => TData
    client: ApolloClient<any>

    [rest: string]: any
}

export interface FindChildren {
    (findChildrenParams: FindChildrenParams): JSX.Element
}

export interface FindProps {
    children: FindChildren
    table: Table
    fields?: string[]
    where?: object
    after?: string
    first?: number
    pollInterval?: number
    notifyOnNetworkStatusChange?: boolean
    fetchPolicy?: FetchPolicy
    errorPolicy?: ErrorPolicy
    ssr?: boolean
    displayName?: string
    skip?: number
    onCompleted?: (data: any | {}) => void
    onError?: (error: ApolloError) => void
    context?: Record<string, any>
    partialRefetch?: boolean
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

    componentWillUnmount() {
        if (!Array.isArray(FindBase.queries)) return
        pull(FindBase.queries, ...this.queryHistory)
    }


    render() {
        FindBase.queries = FindBase.queries || []
        const {
            fields: optionalFields, table, after, first, type, where, skip,
            children,
            pollInterval,
            notifyOnNetworkStatusChange,
            fetchPolicy = 'cache-and-network',
            errorPolicy,
            ssr,
            displayName,
            onCompleted,
            onError,
            context,
            partialRefetch,
            ...props
        } = this.props;
        const fields = optionalFields || table.getFields()
        const {names} = table
        const defaultQuery = this.buildQueryFromFields(fields)
        let queryString: string
        if (type === 'connection') {
            queryString = `query ($where: ${names.input.where[type]}, $after: String, $first: Int, $skip: Int) 
            { ${names.query[type]} (where: $where, after: $after, first: $first, skip: $skip) {
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
        const variables = {where, first, after, skip}
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
                  }) => {
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
                    return children({
                        table,
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

