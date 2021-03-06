---
title: Find One
---

*package*: 'mandarina'

*where*: client 

*type*: JSX.ElementClass

*description*: Find one record by id (or a unique field)

*e.g*:


```typescript jsx
import React from 'react'
import {FindOne} from 'mandarina' 
import Loading from '../Loading' 
import UserCard from '../UserCard' 
import {User} from '../lib/schemas/User' 

const UserDetail=({id})=>(
    <FindOne schema={User} fields={['name','surname','address.city','address.suburb','status']} where={{id}}>
        {({loading,data})=>{
            if (loading) return <Loading/>
            return <UserCard user={data}/>
        }}
    </FindOne>
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
    schema: Schema
    fields?: string[]
    query: DocumentNode
    count: 1
    data: any[]
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
}

```

*description*: FindOne accept as unique child a function which get the followings params

#### 1.1.1) schema
 
*type*: [Schema](schema-constructor)
 
*description*: the schema used in properties


#### 1.1.2) query

*type*: Query

*description*: the graphql query generated by the component


#### 1.1.2) fields

*type*: string[]

*description*: list of asked field in dot notation


#### 1.1.3) count

*type*: number

*description*: total result number

#### 1.1.4) loading
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)
#### 1.1.5) data 
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)
#### 1.1.6) error
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)
#### 1.1.7) variables
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)
#### 1.1.8) networkStatus
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)
#### 1.1.9) refetch
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)
#### 1.1.10) fetchMore
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)
#### 1.1.11) startPolling
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)
#### 1.1.12) stopPolling
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)
#### 1.1.13) subscribeToMore
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)
#### 1.1.14) updateQuery
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)
#### 1.1.15) client
see [Query Render prop function](https://www.apollographql.com/docs/react/essentials/queries.html#render-prop)

### 1.2) schema
 
*type*: [Schema](schema)

*description*: This schema must be used to create a [table](table-constructor)

### 1.3) fields
 
*type*:  string[]

*default*: all fields of the schema

*description*: the fields to be returned by query (in dot notation)

*e.g.*: 
```json
[
  "name",
  "email",
  "address.city",
  "address.suburb"
]
```

### 1.4) where
 
*type*: object

*description*: a "[where unique condition](https://www.opencrud.org/)" valid to [prisma.io](http://prisma.io)

*e.g.*: 
```Json
  {"status": "active"}
```

### 1.4) omitFields

*type*: string[]

*description*: a list of omitted fields in results. Useful when you want to include all fields except some few.


*e.g.*: 
```json
[
  "address.country"
]
```

### 1.5) omitFieldsRegEx

*type*: RegExp

*description*: fields which match with the regexp will be excluded


### 1.6) pollInterval
see [Apollo Query props](https://www.apollographql.com/docs/react/essentials/queries.html#props)
### 1.7) notifyOnNetworkStatusChange
see [Apollo Query props](https://www.apollographql.com/docs/react/essentials/queries.html#props)
### 1.8) fetchPolicy
see [Apollo Query props](https://www.apollographql.com/docs/react/essentials/queries.html#props)
### 1.9) errorPolicy
see [Apollo Query props](https://www.apollographql.com/docs/react/essentials/queries.html#props)
### 1.10) ssr
see [Apollo Query props](https://www.apollographql.com/docs/react/essentials/queries.html#props)
### 1.11) displayName
see [Apollo Query props](https://www.apollographql.com/docs/react/essentials/queries.html#props)
### 1.12) skip
see [Apollo Query props](https://www.apollographql.com/docs/react/essentials/queries.html#props)
### 1.13) onCompleted
see [Apollo Query props](https://www.apollographql.com/docs/react/essentials/queries.html#props)
### 1.14) onError
see [Apollo Query props](https://www.apollographql.com/docs/react/essentials/queries.html#props)
### 1.15) context
see [Apollo Query props](https://www.apollographql.com/docs/react/essentials/queries.html#props)
### 1.16) partialRefetch
see [Apollo Query props](https://www.apollographql.com/docs/react/essentials/queries.html#props)



