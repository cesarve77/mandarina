---
title: Find 
---

Find a set of record for a given search

*e.g*:

```typescript jsx
import React from 'react'
import {FindOne} from 'mandarina' 
import Loading from '.../Loading' 
import UserCard from '.../UserCard' 

const ShowUsersList=({id})=>(
    <Find table={User} fields={['name','surname','address.city','address.suburb','status']} where={{status: 'active'}}>
        {({loading,data})=>{
            if (loading) return <Loading/>
            return data.map((user)=>(
                <>
                    <UserCard user={data}/>
                    <hr/>
                </>
            ))
        }}
    </Find>
)
```

## 1) Properties:

### 1.1) children

*type*: FindChildren
```typescript
interface FindChildren {
    (findChildrenParams: FindChildrenParams): JSX.Element
}
interface FindChildrenParams {
    table: Table
    data:  object[]
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

```

*description*: Find accept as unique child a function which get the followings params

#### 1.1.2) table
 
*type*: Table
 
*description*: Table instance where the data comes from


#### 1.1.3) fields

*type*: boolean

*description*: list of field asked.

*e.g.*: 
```json
[
  "name",
  "email",
  "address.city",
  "address.suburb",
  "status"
]
```

#### 1.1.4) loading

*type*: boolean

*description*: indicates whether the request is in flight

*For more detail see: [Queries](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)*


#### 1.1.5) data 

*type*: object[]

*description*: An object containing the result of your GraphQL query. Defaults to an empty object.

*e.g.*: 
```json
[
  {
      "name": "Jhon",
      "email": "jhon@mandarina.com",
      "address.city": "Gold Coast",
      "address.suburb": "Southport",
      "status": "active"
  },
  {
        "name": "Joan",
        "email": "joan@mandarina.com",
        "address.city": "Brisbane",
        "address.suburb": "Cannon Hill",
        "status": "active"
  }
]
```

#### 1.1.6) error
 
*type*: ApolloError

*description*: A runtime error with graphQLErrors and networkError properties

#### 1.1.7) variables
 
*type*:  TVariables

*description*: An object containing the variables the query was called with

#### 1.1.8) networkStatus
 
*type*:  NetworkStatus

*description*: A number from 1-8 corresponding to the detailed state of your network request. Includes information about refetching and polling status. Used in conjunction with the notifyOnNetworkStatusChange prop.

#### 1.1.9) refetch
 
*type*:  (variables?: TVariables) => Promise<any>

*description*: A function that allows you to refetch the query and optionally pass in new variables

#### 1.1.10) fetchMore
 
*type*: (args: { query?: DocumentNode, variables?: TVariables, updateQuery: Function }) => Promise<any>

*description*: A function that enables pagination for your query


#### 1.1.11) startPolling
 
*type*:  (interval: number) => void

*description*: This function sets up an interval in ms and fetches the query each time the specified interval passes.

#### 1.1.12) stopPolling
 
*type*:  () => void

*description*: This function stops the query from polling.


#### 1.1.13) subscribeToMore
 
*type*:  (options: { document: DocumentNode, variables?: TVariables, updateQuery?: Function, onError?: Function }) => () => void

*description*: A function that sets up a subscription. subscribeToMore returns a function that you can use to unsubscribe.

#### 1.1.14) updateQuery
 
*type*:  (previousResult: TData, options: { variables: TVariables }) => TData

*description*: A function that allows you to update the query’s result in the cache outside the context of a fetch, mutation, or subscription

#### 1.1.15) client
 
*type*:  ApolloClient<any>

*description*: Your ApolloClient instance. Useful for manually firing queries or writing data to the cache.

### 1.2) table
 
*type*: Table

*description*: 

### 1.3) fields
 
*type*:  string[]

*description*: 


### 1.4) where
 
*type*:  object

*description*: 


### 1.5) after
 
*type*:  string

*description*: 


### 1.6) first
 
*type*:  number

*description*: 

### 1.7) skip
 
*type*:  number

*description*: skip n number of record

### 1.8) pollInterval
 
*type*:  number

*description*: Specifies the interval in ms at which you want your component to poll for data. Defaults to 0 (no polling).

### 1.9) notifyOnNetworkStatusChange
 
*type*:  boolean

*description*: Whether updates to the network status or network error should re-render your component. Defaults to false.

### 1.10) fetchPolicy
 
*type*:  FetchPolicy

*description*: How you want your component to interact with the Apollo cache. Defaults to “cache-first”.

### 1.11) errorPolicy
 
*type*:  ErrorPolicy

*description*: How you want your component to handle network and GraphQL errors. Defaults to “none”, which means we treat GraphQL errors as runtime errors.

### 1.12) ssr
 
*type*:  boolean

*description*: Pass in false to skip your query during server-side rendering.

### 1.13) displayName
 
*type*:  string

*description*: The name of your component to be displayed in React DevTools. Defaults to ‘Query’.


### 1.14) onCompleted
 
*type*:  (data: any | {}) => void

*description*: A callback executed once your query successfully completes.

### 1.15) onError
 
*type*: (error: ApolloError) => void

*description*: A callback executed in the event of an error.

### 1.16) context
 
*type*:  Record<string, any>

*description*: Shared context between your Query component and your network interface (Apollo Link). Useful for setting headers from props or sending information to the request function of Apollo Boost.

### 1.17) partialRefetch
 
*type*:  boolean

*description*: If true, perform a query refetch if the query result is marked as being partial, and the returned data is reset to an empty Object by the Apollo Client QueryManager (due to a cache miss). The default value is false for backwards-compatibility’s sake, but should be changed to true for most use-cases.




