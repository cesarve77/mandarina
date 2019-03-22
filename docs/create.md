---
title: Create
---
*package*: 'mandarina'

*where*: client 

*type*: JSX.ElementClass

*description*: It react component used generate a function which when is called create a record in the table with the model passed
    
*e.g.*:

```typescript jsx
import React from 'react'
import {Create} from 'mandarina'
import Like from '../../lib/schemas/Like'
import Button from '../components/Button'
import Loading from '../components/Loading'

const Like = ({postId,userId}) => {
    return (
        <Create table={Like}>
            {({mutate,called,loading}) => {
                if (loading) return <Loading/>
                if (called) return 'You like it'
                return (
                    <Button onClick={()=>mutate({
                        user: {id: userId},
                        post: {id: postId},
                    })}>
                        Like
                    </Button>
                )
            }}
        </Create>
    )
}

```

## Properties

### 1.1) children

*type*:  (mutate: Function, result: MutationResult) => React.ReactNode

*description*: A function that allows you to trigger a mutation from your UI

#### 1.1.1) mutate

*type*: (model: Model) => Promise

*description*: A function to trigger a mutation from your UI. 

##### 1.1.1.1) model

*type*: Object

*description*: A object with the schema shape. 
For sub schemas (object inside object) 
```typescript
const model={
    name: 'John',
    status: {
        name: 'active'
    }
}
```
both objected will be created. 
It will be create a 2 records like this:

In User table:

|id|name|statusId|
|---|---|---|
| newUniqueUserId|John|newUniqueStatusId|

In Status table:

|id|name|
|---|---|
| newUniqueStatusId|Active|

But if you need to connect an record created already, use a object with id as unique property:
```typescript
const model={
    name: 'John',
    status: {
        id: 'existingUniqueStatusId'
    }
}
```

*e.g. connect*:

```typescript jsx
const model={
    name: 'John',
    status: {id: 'cjh0wd3xp00o10b42ung91zjh'}, //connecting with a exiting status
    children:[ //creating 2 new persons
        {
            name: 'Johny',
            status: {id: 'cjh0wd3xp00o10b42ung91zjh'} //connecting with a exiting status
        },
         {
            name: 'Jena',
            status: {id: 'cjh0wd3xp00o10b42ung91zjh'} //connecting with a exiting status
         }
    ]
}

//the model above suits for the following Tables, and it will create three persons (John, Johny, Jena) and connected then to status 'cjh0wd3xp00o10b42ung91zjh'

const Person=new Schema({
    name: {type: String} ,
    status: {type: 'Status'} ,
    children: {type: ['Person']}
})

const Status=new Schema({
    status: {type: String} ,
})

```
<blockquote>
NOTE: This above schemas had to be used to create table in the server
</blockquote>

#### 1.1.2) data
!inc(links/mutation-render-prop-function.md)!
#### 1.1.3) loading
!inc(links/mutation-render-prop-function.md)!
#### 1.1.4) error
!inc(links/mutation-render-prop-function.md)!
#### 1.1.5) called
!inc(links/mutation-render-prop-function.md)!
#### 1.1.6) client
!inc(links/mutation-render-prop-function.md)!

#### 1.1.7) schema
#### 1.1.8) fields
#### 1.1.9) omitFields
#### 1.1.10) omitFieldsRegEx

### 1.2) variables
!inc(links/mutation-props.md)!
### 1.3) update
!inc(links/mutation-props.md)!
### 1.4) ignoreResults
!inc(links/mutation-props.md)!
### 1.5) optimisticResponse
!inc(links/mutation-props.md)!
### 1.6) refetchQueries
!inc(links/mutation-props.md)!
### 1.7) refetchSchemas
### 1.8) awaitRefetchQueries
!inc(links/mutation-props.md)!
### 1.9) onCompleted
!inc(links/mutation-props.md)!
### 1.10) onError
!inc(links/mutation-props.md)!
### 1.11) context
!inc(links/mutation-props.md)!
