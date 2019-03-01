---
title: Action 
sidebar_label: Action
---

Actions are one way to execute customs logic when you need go futher
than a simple CRUD

Any time you create a action you are creating a mutation or query with your custom resolver

class Action constructor  takes 2 params:

1. [schema](#ActionSchema)
2. [options](#ActionOptions)


*e.g.*:
```typescript jsx
import {Action} from 'mandarina'
import User from '../../lib/schemas/User'
const ActionUpgradeUser=new Action(User, options)
```

<blockquote>
**IMPORTANT!:** Actions as schemas and tables should be imported on server side in order to register it
</blockquote>


## 1) Schema<a name="ActionSchema"></a>
*where*: server 

*type*: [Schema](schema-constructor.md) | null

*description*: Most of actions need a payload, this schema determine the shape of the payload,
it is meant to be used together with [ActionForm](action-form) component on client side

You can use null for action without payload

See: [Schema](schema-constructor.md)

## 2) options<a name="SchemaOptions"></a>

*where*: server 

*type*: ActionOptions
```typescript
 interface ActionOptions {
    actions:  {
         [actionName: string]: {
             permission?:  ['everyone'] | ['nobody'] | string[]
             action: (_: any, args: any, context: any, info: any) => any | Promise<any>
             fields?: string[] | {
                 [field: string]:  ['everyone'] | ['nobody'] | string[]
             }
             result: string
         }
     }
    errorFromServerMapper?: ErrorFromServerMapper
}
```

*description*: It define the the action options, including the action itself

*e.g.:*
````typescript jsx
import {Action} from 'mandarina'
import {sendEmail} from '../util/sendEmail'
import ContactForm,{ActionFormInterface} from '../../lib/actions/ContactForm/'
const ActionContactForm=new Action(ContactForm, {
    actions:{
        contact:{
            action: async (_, {email,name,subject,body}: ActionFormInterface)=>{
                const success=await sendEmail({email,name,subject,body})
                return !!success
            },
            result: 'Boolean!'
        }
    },
    permission: ['admin']
})

````

### 2.1) options.actions

*where*: server 

*type*: 
```typescript jsx
 type actions= {
    [actionName: string]: {
       permission?:  ['everyone'] | ['nobody'] | string[]
       action: (_: any, args: any, context: any, info: any) => any | Promise<any>
       fields?: string[] | {
           [field: string]:  ['everyone'] | ['nobody'] | string[]
       }
       result: string
    }
}
``` 

*description*: it object where the properties are the action names and values the definition.

*e.g.*
```typescript jsx
 import {Action} from 'mandarina'
 import {sendEmail} from '../util/sendEmail'
 import UniqueUserSchema,{UniqueUserIterface} from '../../lib/actions/ContactForm/'
 const ActionUserForm=new Action(UniqueUserSchema, {
     actions:{
         upgradeUser:{
             action: async (_, {userId}: UniqueUserIterface,{prisma},info)=>{
                 const user=await prisma.mutate.updateUser({where:{id: userId}, data:{membership: 'premium'}},info)
                 return user
             },
             result: 'User!'
         },
         downgradeUser:{
             action: async (_, {userId}: UniqueUserIterface,{prisma},info)=>{
                 const user=await prisma.mutate.updateUser({where:{id: userId}, data:{membership: 'basic'}},info)
                 return user
             },
         }
         
     },
 })
 ``` 
 
#### 2.1.1) options.actions\[actionName]

*where*: server 

*type*: string

*description*: Mutation name. It should be as actionName property in [ActionForm](action-form)

#### 2.1.1.1) options.actions\[actionName].action

*where*: server 

*type*: (_: any, args: any, context: any, info: any) => any | Promise<any>

*description*: your server logic. It function take as parameters the followings:
 
1. The object that contains the result returned from the resolver on the parent field
2. An object with the payload. must complain the given schema shape.
3. This is an object shared by all resolvers in a particular query. It must contain prisma object.
4. Information about the query. Used in prisma make better queries

And should return what options.actions\[actionName].result

see: [Resolver function signature](https://www.apollographql.com/docs/graphql-tools/resolvers.html#Resolver-function-signature)



#### 2.1.1.2) options.actions\[actionName].result

*where*: server && client

*type*: string

*description*: a unique table name.

*e.g.*
```typescript jsx
 import {Action} from 'mandarina'
 import {sendEmail} from '../util/sendEmail'
 import UniqueUserSchema,{UniqueUserIterface} from '../../lib/actions/ContactForm/'
 const ActionUserForm=new Action(UniqueUserSchema, {
     actions:{
         upgradeUser:{
             action: async (_, {userId}: UniqueUserIterface,{prisma},info)=>{
                 const user=await prisma.mutate.user.updateUser({where:{id: userId}, data:{membership: 'premium'}},info)
                 return user
             },
             result: 'User!'
         },
         downgradeUser:{
             action: async (_, {userId}: UniqueUserIterface,{prisma},info)=>{
                 const user=await prisma.mutate.user.updateUser({where:{id: userId}, data:{membership: 'basic'}},info)
                 return user
             },
         }
         
     },
 })
 ``` 

### 2.5) options.recursive

*where*: server && client

*type*: string[]

*description*: Is normal that a Schema have children which have the parent as a child. e.g.
```graphql
type User{
    name: string!
    posts: [Post!]!
}
type Post{
    author: User
    text: String!
}
```
In this case the Schema will stop the validate model at user.post.user (when find the parent in a descendant) 
If you need to continue validating you need to add the path "post.user " in the array

*default*: []

*e.g.*
```typescript jsx
const Post=new Schema({
    author: {type: 'User'},
    text: {type: String}
},{
    name: 'User',
})   
const User=new Schema({
    name: String,
    validators: ['required'],
    posts: ['Post']
},{
    name: 'User',
    recursive: ["post.user"]
})   
``` 
 
 
### 2.6) options.errorFromServerMapper 

*where*: client

*type*:  (field: string, error: any) => string | undefined

*description*: 

*e.g.*
```typescript jsx
const User=new Schema(schema,{
    name: 'User',
    errorFromServerMapper: (field, error) => {
        if (field === 'email' && error && error.message && error.message === 'GraphQL error: A unique constraint would be violated on User. Details: Field name = email') return 'Email already exists'
        return
    },
})   
``` 
 
 
### 2.7) options.permissions

*where*: server && client

*type*: Permissions 
```typescript
interface Permissions {
    read?:  ['everyone'] | ['nobody'] |  string[]
    create?:   ['everyone'] | ['nobody'] |  string[]
    update?:  ['everyone'] | ['nobody'] |  string[]
    delete?:   ['everyone'] | ['nobody'] |  string[]
}
```

*description*:  It set de default permission for the table fields. see [field permissions](#fieldPermissions)

*e.g.*:

```typescript jsx
const User=new Schema(schema,
    {
        name: 'User',
        permissions:{
            create: ['everybody'],
            read: ['everybody'],
            update: ['user','admin'],
            delete: ['admin']
        }
    })
```

#### 2.7.1)  options.permissions.read

*where*: server && client

*type*: \['everyone'] | \['nobody'] | string[]

*description*: roles separated by '|' which it is guaranteed reading permission for the field


#### 2.7.3)  options.permissions.create

*where*: server && client

*type*: \['everyone'] | \['nobody'] | string[]

*description*:  roles separated by '|' which it is guaranteed creating permission for the field


#### 2.7.4) options.permissions.update

*where*: server && client

*type*: \['everyone'] | \['nobody'] | string[]

*description*:  roles separated by '|' which it is guaranteed updating permission for the field

 
#### 2.7.4) options.permissions.update

*where*: server && client

*type*: \['everyone'] | \['nobody'] | string[]

*description*:  roles separated by '|' which it is guaranteed updating permission for the field

