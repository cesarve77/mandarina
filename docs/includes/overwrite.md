*type*: {[field: string]: OverwriteDefinition}

OverwriteDefinition is basically the same than FieldDefinition but all properties are optional, it mean to overwrite any prop
```typescript jsx
export interface OverwriteDefinition{
    type?: Native | string | Array<string> | Array<Native>,
    label?: Label
    description?: string
    validators?: Array<Validator>
    defaultValue?: any
    form?: {
        initialCount?: number
        transform?: (allowedValues: string[]) => string[]
        component?: React.Component
        placeholder?: string
        col?: false | number | any
        [restFormProps: string]: any

    }
    list?: {
        hidden?: true
        filterMethod?: FilterMethod
        filterComponent?: FilterComponent
        CellComponent?: CellComponent
        loadingElement?: JSX.Element
        filter?: boolean
        width?: number
    }
}

```

*description*: it overwrite any prop in the schema, (use field as dot notation path)

*e.g.*: 
```typescript jsx
import React from 'react'
import {List} from 'mandarin-antd'
import {HiddenField} from 'uniforms-antd/HiddenField'
import ShowActions from './ShowActions'

const UserList=<List schema={UserSchema} overwrite={{'id':{list:{CellComponent: ShowActions}}}}
const CreateUser=<CreateForm schema={UserSchema} overwrite={{'type':{form:{component: HiddenField}}}}
```