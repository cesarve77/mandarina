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

<blockquote>
**IMPORTANT!:** Schemas as actions and tables should be imported on server side in order to register it
</blockquote>

*e.g.*:
```typescript jsx
import {Schema} from 'mandarina'
const User=new Schema(shape, options)
```
## 1) shape<a name="SchemaSchema"></a>
*where*: server && client

*type*: SchemaShape
```typescript 
interface SchemaShape {
    [fieldName: string]:FieldDefinition
}
```


*description*: SchemaShape is a object where each property is a [field name](#fieldName) and the value is its [fieldDefinition](#fieldDefinition)

```typescript jsx
const schema={'fieldName': fieldDefinition}
```

### 1.1) field name<a name="fieldName"></a>: string
*where*: server && client

*type*: string

*description*: It is a string compatible with a data base field name, must be start with a letter and contains just letters, numbers and few special chars like '-' and '_'

*e.g.*:
```typescript jsx
import {Schema} from 'mandarina'
const User=new Schema({firstName: fieldDefinition}, options)
```

### 1.2 ) fieldDefinition<a name="fieldDefinition"></a>: Object

*where*: server && client

*type*: FieldDefinition
```typescript
interface FieldDefinition {
    type: String | String[] | Number | Number[] | string | string[] 
    label: String |  ((definition: FieldDefinition) => string)  | false
    description?: string
    validators?: Array<Validator | string>
    defaultValue?: any
    transformValue?: (value: any) => any
    form: {
        initialCount?: number
        transform?: (allowedValues: string[]) => string[] 
        component?: React.Component
        placeholder?: string 
        col?: false | number | object //https://ant.design/components/grid/#Col
    };
    list:  {
        hidden?: true
        filterMethod?: FilterMethod
        filterComponent?: FilterComponent
        CellComponent?: CellComponent
        loadingElement?: JSX.Element
        filter?: boolean
        width?: number
    }
    table: {
        default?: any
        rename?: string
        unique?: boolean,
        relation?: string | {
            name?: string
            onDelete?: 'SET_NULL' | 'CASCADE'
        }
    },
    permissions: Permissions
}

````

*e.g.*:
```typescript jsx
import {Schema} from 'mandarina'
const User=new Schema({
    firstName: {
        type: String, 
        validators:['required']
        //... others
    },
}, options)
```


*description*: It object define the field in all scenarios as when it is showing in a form, list or in the table

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
import {Schema} from 'mandarina'
const User=new Schema({
    firstName: {type: String}, 
    tags:  {type: [String]},
    posts: {type: ['Post']} // Where Post is another schema named 'Post' see below
}, {
    name: 'User'
})

const Post=new Schema({
    post: {type: String}, 
    comments: {type: ['Comment']}, //  Where Comment is another schema named 'Comment' not showing in this example
    author: {type: 'User'} // Where post is another schema named 'Post'
}, {
    name: 'Post'
})
```

#### 1.2.2)  schema\[fieldName\].label


*where*: server && client

*type*: string |  ((definition: FieldDefinition) => string)  | false

*default*: If it not defined the label will be take it humanizing the field name

*description*: User friendly name for the field, o a function to resolve it, use false fot not show label in list or forms

*e.g*

```typescript jsx
import {Schema} from 'mandarina'
const User=new Schema({
    name: {type: String, label: 'Full name'}, 
   
}, {
    name: 'User'
})
```



#### 1.2.3)  schema\[fieldName\].description


*where*: server && client

*type*: string 

*description*: additional description form field, it used for some tooltips in list and forms.

*e.g*

```typescript jsx
import {Schema} from 'mandarina'
const User=new Schema({
    name: {type: String, label: 'Full name', description: 'As appear in your passport'}, 
   
}, {
    name: 'User'
})
```

#### 1.2.4) schema\[fieldName\].validators

*where*: server && client

*type*: Array<string | Validator>

*description*:  Validate the data in the field, form be required for example.

You can use one of the prebuild validator or you custom validator, for more detail see [validators](validators.md)  

*e.g.*:
```typescript jsx
import {Schema} from 'mandarina'
const User=new Schema({
    firstName: {type: String, validators: ['required']},
    age: {type: String, validators: [{minValue: 18}, {maxValue: 45}]},
}, options)
```


#### 1.2.5)  schema\[fieldName\].defaultValue

*where*: client

*type*: any | ()=>any

*description*: Default value in form when nothing is provided, can be a function returning any value.

*e.g.*:
```typescript jsx
import {Schema} from 'mandarina'
const User=new Schema({from: {type: Date, defaultValue: ()=>new Date()}}, options)
```

#### 1.2.7)  schema\[fieldName\].form

*where*: client

*type*: 
```typescript
type form={
        initialCount?: number
        transform?: (allowedValues: string[]) => string[]
        component?: React.Component
        placeholder?: string
        col?: false | number | any
    }
```

*description*: Here you can specify how to render the field in the form. 

*e.g.*:
```typescript jsx
import {Schema} from 'mandarina'
const User=new Schema({description: {type: String, form: {component: LongTextField}}}, options)
```

#### 1.2.7.1)  schema\[fieldName\].form.initialCount

*where*: client

*type*: number


*description*: It apply just for Array fields. At least this amount of fields will be rendered at the beginning.

See: [Uniforms ListField](https://github.com/vazco/uniforms/blob/master/API.md#listfield) 

*e.g.*:
```typescript
import {Schema} from 'mandarina'
const User=new Schema({description: {type: [String], form: {initialCount: 1}}}, options)
```

#### 1.2.7.2)  schema\[fieldName\].form.transform

*where*: client

*type*: (allowedValues: string[]) => string[]

*description*: Allows to transform the each value into a human-readable label

See: [Uniforms SelectField](https://github.com/vazco/uniforms/blob/master/API.md#selectfield) 

*e.g.*:
```typescript
import {Schema} from 'mandarina'
const User=new Schema({
    frequency: {
        type: Number,
        validators:[{allowedValues:[7,30,365]}] ,
        form: {
            transform(value){
                switch (value) {
                   case 7:
                       return 'Weekly'
                   case 30:
                       return 'Monthly'
                   case 365:
                       return 'Yearly'
                }
            }
        }
    }
    }, options)
```

#### 1.2.7.3)  schema\[fieldName\].form.component

*where*: client

*type*: React 

*description*: Uniform component to be used when render a form.

It can be one of [build in uniform components](https://github.com/vazco/uniforms/blob/master/INTRODUCTION.md#fields-components)
or your [custom uniform component](https://github.com/vazco/uniforms/blob/master/INTRODUCTION.md#example-rangefield)


*e.g.*:
```typescript
import {Schema} from 'mandarina'
import LongTextField from 'uniforms-antd/LongTextField'
const User=new Schema({description: {type: [String], form: {component: LongTextField}}}, options)
```

#### 1.2.7.4)  schema\[fieldName\].form.placeholder


*where*: client

*type*: string

*description*: a place holder for field forms

*e.g.*:
```typescript
import {Schema} from 'mandarina'
const User=new Schema({name: {type: [String], form: {placeholder: 'e.g. John Doe'}}}, options)
```

#### 1.2.7.5)  schema\[fieldName\].form.col

*where*: client

*type*: false | number | any

*description*: It defined the Column Grid wrapping the field form.

If the value is a number willl be used as span, if not should be the props for [Antd Col](https://ant.design/components/grid/#Col)

See: [Antd Col](https://ant.design/components/grid/#Col) 

*e.g.*:
```typescript
import {Schema} from 'mandarina'
const User=new Schema({description: {type: [String], form: {col: 12}}}, options)
```


#### 1.2.7)  schema\[fieldName\].list

*where*: client

*type*: 
```typescript
type list={
      hidden?: true
      filterMethod?: FilterMethod
      filterComponent?: FilterComponent
      CellComponent?: CellComponent
      loadingElement?: JSX.Element
      filter?: boolean
      width?: number

}
  
type FilterMethod = (filter: any) => any //any acceptable query format for prisma 

type FilterComponent = ((props: any) => JSX.Element) | null

type CellComponent = (props: CellComponentProps,context: any) => JSX.Element | null

interface CellComponentProps {
    columnIndex: number
    rowIndex: number
    data: any[]
    field: string
    [rest: string]: any
}
```
#### 1.2.7.1)  schema\[fieldName\].list.hidden

*where*: client

*type*: boolean 

*default*: false

*description*: If the field should be show it in the list or not.

*e.g.*:
```typescript jsx
import {Schema} from 'mandarina'
const User=new Schema({
    firstName: {type: String, validators: ['required']},
    status: {type: String, list:{hidden: true}},
}, options)
```

#### 1.2.7.2)  schema\[fieldName\].list.filterComponent

*where*: client

*type*: (props: any) => JSX.Element) 

*default*: It will render a uniform component based on the field definition type

*description*: component to show a filter on the list, the onChange value returned by it will be passed to 
list.filterMethod to create a "[where condition](https://www.opencrud.org/)" for prisma.io

Normally if you build your own filterComponent you need to build your own filterMethod, Unless you based on our default component

*e.g.*:
```typescript jsx
import {Schema} from 'mandarina'
import TextField from 'uniforms-antd/TextField'
const User=new Schema({
    firstName: {type: String, validators: ['required']},
    description: {type: String, list:{filterComponent: TextField, filterMethod}}, //see next example
}, options)
```

#### 1.2.7.3)  schema\[fieldName\].list.filterMethod

*where*: client

*type*: (filter: any) => any 

*default*: It will a function based on the field definition

*description*: It function take the result of filterComponent and should transform to a "[where condition](https://www.opencrud.org/)" valid to prisma.io

*e.g.*:
```typescript jsx
import {Schema} from 'mandarina'
import TextField from 'uniforms-antd/TextField'
const User=new Schema({
    firstName: {
        type: String, 
        validators: ['required'],
        type: String, 
        list:{
             filterComponent: TextField,
             filterMethod:  (filter: string)=>{
                 return {firstName_contains: filter} //see https://www.opencrud.org/
             }
        }
    },
}, options)
```

#### 1.2.7.4)  schema\[fieldName\].list.CellComponent

*where*: client

*type*:
```typescript
type CellComponent={
    columnIndex: number
    rowIndex: number
    data: any[]
    field: string
}
```

*description*: React component to render the cell content in the table

It receive the following properties

- data: the collection for records generated for the query
- columnIndex: the column number rendering
- rowIndex: the row number rendering
- field: the field path. e.g. 'address.street'

*default*: A react component which render any scalar or array of scalars



*e.g.*:


```typescript jsx
import React from 'react'
import {Schema} from 'mandarina'
import {get} from 'mandarina/build/Schema/utils'

const CellComponent = ({columnIndex, rowIndex, data, field}) => {
    const email = data[rowIndex] && get(data[rowIndex], field.split('.'))
    return <a href={`mailto:${email}`}>{email}</a>
}

const User=new Schema({email: {type: String, list:{CellComponent}}}, options)

```

#### 1.2.7.5)  schema\[fieldName\].list.loadingElement

*where*: client

*type*: React.ReactNode

*default*: <>...</>

*description*: a element to showing a loading indicator

*e.g.*:
```typescript jsx
import { Spin } from 'antd';
import {Schema} from 'mandarina'
const loadingElement=<Spin />
const User=new Schema({email: {type: String, list:{loadingElement} }}, options)
```

#### 1.2.7.6)  schema\[fieldName\].list.filter

*where*: client

*type*: boolean

*default*: true

*description*: if filter will be showed ot not 


*e.g.*:
```typescript jsx
const User=new Schema({email: {type: String, list:{filter: false} }}, options)
```

#### 1.2.7.7)  schema\[fieldName\].list.width


*where*: client

*type*: number

*default*: 200

*description*: column width in px


*e.g.*:
```typescript jsx
const User=new Schema({email: {type: String, list:{width: 350} }}, options)
```


#### 1.2.10)  schema\[fieldName\].permissions: Object <a name="fieldPermissions"></a>

*where*: server && client

*type*: Permissions
```typescript
interface Permissions {
    read?: Permission
    create?: Permission
    update?: Permission
    delete?: Permission
}

type Permission = ['everyone'] | ['nobody'] | string[]
```

*description*: Create, read and update Permission for each individual field.

There are 2 reserved roles 'everyone' | 'nobody' any other string will be take as a role. Any user with this role is allowed to read/create/update the field.
* \['everyone'] give all permission to every user or guest
* \['nobody'] deny all permission to every user and should be use alone, (not in combination of other role)

*default*:  If it not defined permission will be inherited from the table permissions 

*e.g.*:

```typescript jsx
const User=new Schema({
    userName:{
        type: String,
        permissions:{
            create: ['admin'],
            read: ['everybody'],
            update: ['admin'],
        }
    },
    email:{
        permissions:{
            create:  ['admin'],
            read: ['admin','staff'], 
            update: ['nobody']
        }
    }
},options)
```

#### 1.2.10.1)  schema\[fieldName\].permissions.read

*where*: server && client

*type*: \['everyone'] | \['nobody'] | string[]

*description*: roles separated by '|' which it is guaranteed reading permission for the field


#### 1.2.10.2)  schema\[fieldName\].permissions.create

*where*: server && client

*type*: \['everyone'] | \['nobody'] | string[]

*description*:  roles separated by '|' which it is guaranteed creating permission for the field


#### 1.2.10.3)  schema\[fieldName\].permissions.update

*where*: server && client

*type*: \['everyone'] | \['nobody'] | string[]

*description*:  roles separated by '|' which it is guaranteed updating permission for the field



## 2) Options<a name="SchemaOptions"></a>

*where*: server && client

*type*: TableOptions
```typescript
interface SchemaOptions {
    name: string
    recursive?: string[]
    errorFromServerMapper?: (field: string, error: any) => string | undefined;
    permissions?:  {
        read?: ['everyone'] | ['nobody'] | string[]
        create?: ['everyone'] | ['nobody'] | string[]
        update?: ['everyone'] | ['nobody'] | string[]
        delete?: ['everyone'] | ['nobody'] | string[]
    }
}
```

*description*: It define the Schema behavior 

*e.g.:*
````typescript jsx
import {Table} from 'mandarina'

const User= new Schema({
    name: {type: String},
    surname: {type:String},
    email: {type:String, validators:['isEmail']}
},{
    name: 'User',
    errorFromServerMapper: (field, error) => {
        if (field === 'email' && error && error.message && error.message === 'GraphQL error: A unique constraint would be violated on Template. Details: Field name = template') return 'Template ID already exists'
        return
    },
    permissions: {
        read: 'admin|staff',
        create : 'everybody',
        update: 'user',
        delete: 'admin|user',
    },
})

````

### 2.1) options.name

*where*: server && client

*type*: string

*description*: a unique table name.

*e.g.*
```typescript jsx
const User=new Schema(schema,{
    name: 'User'
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

