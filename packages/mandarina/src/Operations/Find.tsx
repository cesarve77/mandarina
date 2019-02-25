import React, {PureComponent} from 'react'
import {Schema} from '..'
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {buildQueryFromFields} from "./utils";
import pull from 'lodash.pull'
import {ApolloError, ErrorPolicy, FetchPolicy, NetworkStatus} from "apollo-client";
import {DocumentNode} from "graphql";
import ApolloClient from "apollo-client/ApolloClient";
import {filterFields} from "../utils";

type TVariables = { [key: string]: any }
type TData = any

export interface FindChildrenParams {
    schema: Schema
    data: any | any[]
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
    (findChildrenParams: FindChildrenParams):  React.ReactNode
}

export interface FindProps {
    children?: FindChildren
    schema: Schema
    fields?: string[]
    omitFields?: string[]
    omitFieldsRegEx?: RegExp
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

    componentWillMount(): void {
        FindBase.queries = FindBase.queries || []
        //todo: **1
    }

    componentWillUnmount() {
        if (!Array.isArray(FindBase.queries)) return
        pull(FindBase.queries, ...this.queryHistory)
    }


    render() {

        const {
            fields: optionalFields , schema, after, first, type, where, skip,
            omitFields,
            omitFieldsRegEx,
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
        let fields = filterFields( schema.getFields(),optionalFields , omitFields,omitFieldsRegEx)

        const {names} = schema
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

