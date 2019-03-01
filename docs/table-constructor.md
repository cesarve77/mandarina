---
title: Schema - Constructor
sidebar_label: Constructor
---


Schema is the base of all components in Mandarina

Form schemas mandarina is able to create:

- Tables
- Form
- Lists

Schemas are rigid and dynamic, maybe it is the biggest limitation of mandarina, you are no able to build a schema on the fly or programmatically. 



class Schema constructor  takes 2 params:

1. [shape](#SchemaSchema)
2. [options](#SchemaOptions)


*e.g.*:
```typescript jsx
const User=new Schema(shape, options)
```
## 1) shape<a name="TableSchema"></a>
*where*: server && client

*type*: UserSchemaShape
```typescript 
interface UserSchemaShape {
    [fieldName: string]:FieldDefinition
}
```


*description*: SchemaShapeStrict is a object where each property is a [field name](#fieldName) and the value is its fieldDefinition (#fieldDefinition)

```typescript jsx
const schema={'fieldName': fieldDefinition}
```

### 1.1) field name<a name="fieldName"></a>: string
*where*: server && client

*type*: string

*description*: It is a string compatible with a data base field name, normally must be start with a letter and contains just letters, numbers and few special chars like '-' and '_'

*e.g.*:
```typescript jsx
const User=new Table({firstName: fieldDefinition}, options)
```

### 1.2 ) fieldDefinition<a name="fieldDefinition"></a>: Object
*where*: server && client

*type*: FieldDefinition
```typescript
interface FieldDefinition {
    type: Native | string | Array<string> | Array<Native>,
    label: Label
    description?: string
    validators: Array<Validator>
    defaultValue: any
    transformValue: (value: any) => any
    form: any;
    list: any;
    unique: boolean
    permissions?: Permissions
}

````

*description*: It is a object with followings properties

*e.g.*:
```typescript jsx
const User=new Table({
    firstName: {
        type: String, 
        validators:['required']
        //... others
    },
}, options)
```


#### 1.2.1)  schema\[fieldName\].type

*where*: server && client

*type*: String | \[String\] | Number | \[Number\] | Table.Integer | \[Table.Integer\] | string | [\string\]

*description*: Field type.

Possible values: 

|  value  | description  |
|---|---|
|String|for a string|
|\[String\]|for a array of strings|
|Number|for a decimal numbers|
|\[Number\]|for a array of decimal numbers|
|Table.Integer|for a integers values|
|\[Table.Integer\]|for a array of integers values|
|"Table Name"|for a object, eg. "User"|
|\["Table Name"\]|for a object,eg. \["User"\]|

*e.g*

```typescript jsx
const User=new Table({firstName: {type: String}, tags: [String]}, options)
```

#### 1.2.2)  schema\[fieldName\].validators

*where*: server && client

*type*: Validator[]
```typescript jsx
interface Validator {
    validatorName: string | undefined
    param: any

    new({key, definition, path, value}: ValidatorParams): ValidatorInterface
}
```

*description*: Here you can find a list of preconfigure [validators](validators.md)

a Validator can be a string or a object 

* String with the name of the constraint (for validations which doesn't needs any params like 'required')

*e.g.*:
```typescript jsx
const User=new Table({firstName: {type: String, validators: ['required']}}, options)
```

* Object with one key as name of the constraint and any param as value.

*e.g.*:
```typescript jsx
const User=new Table({age: {type: String, validators: [{minValue: 18}, {maxValue: 45}]}}, options)
```

* [A Custom validator](validators-creator.md). 

You can create a register your custom validators. See [A Custom validator](validators-creator.md).


#### 1.2.3)  schema\[fieldName\].label

*where*: client

*type*:  string | (definition: UserFieldDefinition) => string | ""

*description*: The field label in the form and/or the column header in a table. Or a function to return a string, use "" for avoid the label

*default*: If it not defined the label will be take it humanizing the field name

*e.g.*:
```typescript jsx
const User=new Table({name: {type: String, label: 'Full name'}}, options)
```

#### 1.2.4)  schema\[fieldName\].description

*where*: client

*type*: string 

*description*: More detail about the field, it will be displayed when mouse over the form label/table header.

*e.g.*:
```typescript jsx
const User=new Table({address: {type: String, label: 'Your postal address for the delivery'}}, options)
```

#### 1.2.5)  schema\[fieldName\].defaultValue

*where*: client

*type*: any | ()=>any

*description*: Default value in form when nothing is provided, can be a function returning any value.

*e.g.*:
```typescript jsx
const User=new Table({from: {type: Date, defaultValue: ()=>new Date()}}, options)
```

#### 1.2.6)  schema\[fieldName\].form

*where*: client

*type*: {component: JSX.ElementClass, [props: string]: any}

*description*: Here you can specify how to render the field in the form. see //TODO

*e.g.*:
```typescript jsx
const User=new Table({description: {type: String, form: {component: LongTextField}}}, options)
```

#### 1.2.7)  schema\[fieldName\].list

*where*: client

*type*: {[props: string]: any}

*description*: Here you can specify how to render the field in the list. see //TODO

#### 1.2.8)  schema\[fieldName\].unique

*where*: server

*type*: boolean

*description*: It indicate if the field inm the data base should be unique

*default*: false

*e.g.*:
```typescript jsx
const User=new Table({email: {type: String, unique: true}, name: {type: String}}, options)
```

#### 1.2.9)  schema\[fieldName\].virtual:

*where*: client

*type*: boolean

*description*: Set it to true if this field should not be in the table just in forms or table, eg. for a password confirmation field or a total field in a table (in this case is not possible order or search for this virtual field). It does not work when the [table is virtual](#virtualTable) (in this case all field are virtual)

*default*: false

*e.g.*:
```typescript jsx
const User=new Table({repeatPassword: {type: String, virtual: true, form: {component: TextField, type: 'password'}}}, options)
```

#### 1.2.10)  schema\[fieldName\].permissions: Object <a name="fieldPermissions"></a>

*where*: server && client

*type*: Permissions
```typescript
interface Permissions {
    read?:  'everyone' | 'nobody' | string
    create?:  'everyone' | 'nobody' | string
    update?:  'everyone' | 'nobody' | string
}
```

*description*: Create, read and update Permission for each individual field.

There are to reserved roles 'everyone' | 'nobody' any other string will be take as a role. Any user with this role is allowed to read/create/update the field.
* 'everyone' give all permission to every user or guest
* 'nobody' deny all permission to every user and should be use alone, (not in combination of other role)

*default*:  If it not defined permission will be inherited from the table permissions 

*e.g.*:

```typescript jsx
const User=new Table({
    userName:{
        type: String,
        permissions:{
            create: 'admin',
            read: 'everybody',
            update: 'nobody'
        }
    },
    email:{
        permissions:{
            create: 'admin',
            read: 'admin|staff',
            update: 'nobody'
        }
    }
},options)
```

#### 1.2.10.1)  schema\[fieldName\].permissions.read

*where*: server && client

*type*: 'everyone' | 'nobody' | string

*description*: roles separated by '|' which it is guaranteed reading permission for the field


#### 1.2.10.2)  schema\[fieldName\].permissions.create

*where*: server && client

*type*: 'everyone' | 'nobody' | string

*description*:  roles separated by '|' which it is guaranteed creating permission for the field


#### 1.2.10.3)  schema\[fieldName\].permissions.update

*where*: server && client

*type*: 'everyone' | 'nobody' | string

*description*:  roles separated by '|' which it is guaranteed updating permission for the field



## 2) Options<a name="TableOptions"></a>

*where*: server && client

*type*: TableOptions
```typescript
interface TableSchemaOptions {
    name: string
    virtual?: boolean
    forceType?: boolean
    filterExtraKeys?: boolean
    recursive?: string[]
    errorFromServerMapper?: ErrorFromServerMapper
    permissions?: Permissions
    virtual?: boolean
    onBefore?: Hook
    onAfter?: Hook
    resolvers?: ResolversInterface
} 
```

*description*: It define the Table behavior 

*e.g.:*
````typescript jsx
import {Table} from 'mandarina'

const User= new Table({
    name: {type: String},
    surname: {type:string},
    email: {type:string, unique: true, validators:['isEmail']}
},{
    name: 'User',
    virtual: false,
    forceType: true,
    filterExtraKeys: true,
    errorFromServerMapper: (field, error) => {
        if (field === 'email' && error && error.message && error.message === 'GraphQL error: A unique constraint would be violated on Template. Details: Field name = template') return 'Template ID already exists'
        return
    },
    permissions: {
        read: 'admin|staff',
        create : 'everybody',
        update: 'user',
        delete: 'admin|user',
        filter: (user, {action,id}) =>{
            if (action==='Update' && user.roles.includes('user')){ // if a user try to update a user we limit the action only to their own user 
                return {id: user.id}
            }
        },
    },
    onBefore: async (action, _, {data}, {prisma}, info) => {
        if (action==='create') {
            const exist = await prisma.exists.User({email})
            if (exist) throw new Error('Email already exist!') // it is not really necessary because we are marking email field as unique, and we are using errorFromServerMapper for a show friendly error
        }
    },
    onAfter: (type, action, _, data, {prisma, result}, info) => {
        sendWelcomeEmail(result.email)
    },
    resolvers: {
        signIn: {
            resolver: async (_, data, {prisma, request}, info) => {
               //normally this is used with virtual tables, but here you can create your custom resolvers
            },
            type: "mutation",
            result: "String!",
         }
    }
})

````

### 2.1) options.name

*where*: server && client

*type*: string

*description*: a unique table name.

*e.g.*
```typescript jsx
const User=new Table(schema,{
    name: 'User'
})   
``` 

### 2.2) options.virtual 

*where*: server && client

*type*: boolean

*description*: set to true for avoid create a table in the data base. Works for create form, use it together with resolvers to create custom forms that perform a action in the server.

*default*: false

*e.g.*
```typescript jsx
const User=new Table(schema,{
    name: 'User',
    virtual: true,
})   
``` 
 
 
### 2.3) options.forceType

*where*: server && client

*type*: boolean

*description*: always that is possible it force the result of the form to field type.
It more for internal use, don't change it 

*default*: true

*e.g.*
```typescript jsx
const User=new Table(schema,{
    name: 'User',
    forceType: true,
})   
``` 
 
 
### 2.4) options.filterExtraKeys

*where*: server && client

*type*: boolean

*description*: when clear a model it remove all properties no present in the schema.
It more for internal use, change it if you know what are you doing

*default*: true

*e.g.*
```typescript jsx
const User=new Table(schema,{
    name: 'User',
    filterExtraKeys: true,
})   
``` 
 
 
### 2.5) options.recursive

*where*: server && client

*type*: string[]

*description*: Is normal that a Table have children which have the parent as a child. e.g.
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
In this case the Table will stop the validate model at user.post.user (when find the parent in a descendant) 
If you need to continue validating you need to add the path "post.user " in the array

*default*: []

*e.g.*
```typescript jsx
const Post=new Table({
    author: {type: 'User'},
    text: {type: String}
},{
    name: 'User',
})   
const User=new Table({
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
const User=new Table(schema,{
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
    read?:  'everyone' | 'nobody' | string
    create?:  'everyone' | 'nobody' | string
    update?:  'everyone' | 'nobody' | string
    delete?:  'everyone' | 'nobody' | string
    filter?: (this: any, user: { userId: string, roles: string[] }, args: {action:  'create' | 'read' | 'update' | 'delete' , id: string}) => Promise<Object> | Object | undefined
}
```

*description*:  It set de default permission for the table fields. see [field permissions](#fieldPermissions)

*e.g.*:

```typescript jsx
const User=new Table(schema,
    {
        name: 'User',
        permissions:{
            create: 'everybody',
            read: 'everybody',
            update: 'user|admin',
            delete: 'admin'
        }
    })
```

#### 2.7.1)  options.permissions.read

*where*: server && client

*type*: 'everyone' | 'nobody' | string

*description*: roles separated by '|' which it is guaranteed reading permission for the field


#### 2.7.3)  options.permissions.create

*where*: server && client

*type*: 'everyone' | 'nobody' | string

*description*:  roles separated by '|' which it is guaranteed creating permission for the field


#### 2.7.4) options.permissions.update

*where*: server && client

*type*: 'everyone' | 'nobody' | string

*description*:  roles separated by '|' which it is guaranteed updating permission for the field

 
#### 2.7.4) options.permissions.update

*where*: server && client

*type*: 'everyone' | 'nobody' | string

*description*:  roles separated by '|' which it is guaranteed updating permission for the field

 
### 2.8) options.onBefore

*where*: server 

*type*: (action: 'create' | 'read' | 'update' | 'delete', root: any, args: any, context: any, info: any): Promise<any> | void | any

*description*: It function will be execute before performance any action into the table.

It takes 5 params

* action: the action being executing in the table. One of this 'create' | 'read' | 'update' | 'delete'
* root: the root param in the graphQL resolver
* args: the args param in the graphQL resolver, for us will be the form model
* context: the context attached in the graphQL server, normally the user and prisma at least.
* info: AST in the graphQL resolver, we can used together with prisma to fetch only the fields asked for the client. See [Schema delegation using the info object](https://www.prisma.io/docs/prisma-graphql-api/prisma-bindings/prisma-bindings-prb1/#schema-delegation-using-the-info-object)

It can return a Promise and it be resolved before execute any action in to the table.

If the promise is rejected a error will throw and the action will stop

*e.g.*
```typescript jsx
const User=new Table(schema,{
    name: 'User',
    onBefore: async (action, _, {data}, {prisma}, info) => {
        if (action==='create') {
            const exist = await prisma.exists.User({email})
            if (exist) throw new Error('Email already exist!') // it is not really necessary because we are marking email field as unique, and we are using errorFromServerMapper for a show friendly error
        }
    },
})   
``` 
 
 
### 2.9) options.onAfter

*where*: server 

*type*: (action: 'create' | 'read' | 'update' | 'delete', root: any, args: any, context: any, info: any): void 

*description*: It function will be execute after the action into the table.

It takes 5 params

* action: the action being executing in the table. One of this 'create' | 'read' | 'update' | 'delete'
* root: the root param in the graphQL resolver
* args: the args param in the graphQL resolver, for us will be the form model
* context: the context attached in the graphQL server now with a extra property "result" which contain the new object create or modified in the action, or the old object for deletion.
* info: AST in the graphQL resolver, we can used together with prisma to fetch only the fields asked for the client. See [Schema delegation using the info object](https://www.prisma.io/docs/prisma-graphql-api/prisma-bindings/prisma-bindings-prb1/#schema-delegation-using-the-info-object)

It can return a Promise and it be resolved before execute any action in to the table.

If the promise is rejected a error will throw and the action will stop

*e.g.*
```typescript jsx
const User=new Table(schema,{
    name: 'User',
    onAfter: (type, action, _, data, {prisma, result}, info) => {
       sendWelcomeEmail(result.email)
   }
})
```

### 2.10) options.resolvers

*type*: ResolversInterface
```typescript
interface ResolversInterface {
    [name: string]: {
        resolver: (_: any, args: any, context: any, info: any) => any | Promise<any>
        type: "mutation" | "query"
        result: string
    }
}
```
        
*description*: //TODO 

*e.g.*
```typescript jsx
const User= new Table({
    name: {type: String},
    password: {type:string, form:{type:'password'}},
},{
    name: 'User',
    virtual: true,
    resolvers: {
        signIn: {
            resolver: async (_, data, {prisma, request}, info) => {
                const user = await prisma.query.user({where: {email}}, '{id,email,roles,hash}')
                if (!user) throw new Error('Email not found')
                if (!user.hash) throw new Error('No Password set')
                const bcrypt = require('bcrypt')
                if (!bcrypt.compareSync(password, user.hash)) throw new Error('Wrong password')
                const jwt = require('jsonwebtoken')
                return jwt.sign(user, privateKey, {algorithm: "RS256"});
            },
            type: "mutation",
            result: "String!",
         }
    }
})
``` 
 