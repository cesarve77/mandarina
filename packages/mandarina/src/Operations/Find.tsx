import React, {ComponentType, PureComponent} from 'react'
import {Schema} from '..'
import gql from "graphql-tag";
import {Query, QueryProps, QueryResult} from "react-apollo";
import {buildQueryFromFields, insertHaving} from "./utils";
import Observer from "../Observer";
import Auth, {ActionType, AuthChildrenProps, AuthElementsProps} from "../Auth/Auth";

export const  canUseDOM = !!(
    (typeof window !== 'undefined' &&
        window.document && window.document.createElement)
);

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

export type Having = {
    [field: string]: any
}

export interface FindProps extends FindQueryProps {
    children?: FindChildren
    schema: Schema
    fields: string[]
    skip?: number
    sort?: { [field: string]: -1 | 1 }
    where?: object
    after?: string
    first?: number
    having?: Having
    transformData?: <T=any>(data: T) => T
    //todo: crear un parametro para hacer el refrescamiento de los quieres **1
}

export interface FindBaseProps {
    type: 'single' | 'plural' | 'connection'
}

export interface FindBaseState {
    fields: string[]
}

export class FindBase extends PureComponent<FindProps & FindBaseProps, FindBaseState> {
    static defaultProps = {where: {}, first: undefined}
    queryHistory: object[] = []

    buildQueryFromFields = (fields: string[]) => buildQueryFromFields(fields)

    constructor(props: FindProps & FindBaseProps) {
        super(props)

    }



    render() {

        const {
            fields, schema, after, first, type, where, skip, sort,
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
            having,
            transformData,
            ...props
        } = this.props;
        let orderBy: undefined | string
        if (sort) {
            const field = Object.keys(sort)[0]
            orderBy = field + (sort[field] > 0 ? '_ASC' : '_DESC')
        }
        const {names} = schema
        const defaultQuery = insertHaving(this.buildQueryFromFields(fields.filter(field => this.props.schema.hasPath(field))), having)
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
                    } else {
                        console.error(error)
                    }
                    if (transformData) {
                        data = transformData(data)
                    }
                    if (!children) return null
                    const childrenResult=children({
                        schema,
                        //@ts-ignore
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
                    if (pollInterval && canUseDOM){
                        const observerProps ={refetch,pollInterval,startPolling,stopPolling}
                        return <Observer {...observerProps} variables={variables}>{childrenResult}</Observer>
                    }else{
                        return childrenResult
                    }
                }}
            </Query>
        )
    }
}


export const FindOne = (props: FindProps) => <FindBase type='single' {...props}/>

export const Find = (props: FindProps) => <FindBase type='connection' {...props}/>


export const AuthFindBase = ({Component,children, schema, denied = null, userRoles = [], action, fields: fieldsOri, Error, ...props}:
                    { Component: ComponentType<FindProps | FindProps>, action: ActionType } & (FindProps) & AuthElementsProps) => {
    return (
      // @ts-ignore
      <Auth schema={schema} action={action} userRoles={userRoles} fields={fieldsOri}>
          {({fields, loading, error,readFields}: AuthChildrenProps) => {
              if (error && Error) return <Error error={error}/>
              if (!loading && fields && fields.length === 0) return denied
              if (loading) {
                  // @ts-ignore
                  return children && children({
                      error: null,
                      data: null,
                      loading: true,
                  } as  QueryResult)
              }
              return (
                <>
                    {fields && <Component schema={schema} {...props} children={children} fields={fields} />}
                </>
              );
          }}
      </Auth>
    )
}

export const AuthFindOne = (props: FindProps & AuthElementsProps) => <AuthFindBase Component={FindOne} action={'read'} {...props}/>

export const AuthFind = (props: FindProps & AuthElementsProps) => <AuthFindBase Component={Find} action={'read'} {...props}/>
