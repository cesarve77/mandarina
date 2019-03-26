---
title: Schema - Methods
sidebar_label: Methods
---

# 1 Instance methods
    
## 1.1 validate
    
validate: ErrorValidator[]

*where*: sever & client

*type*: (model: Model, fields: string[]     = this.getFields()) : ValidatorError[]

*description*: used to validate a object against the schema

this function which take 2 parameters:

- model: a object to validate
- fields: array of path, with the fields to validate, if is omitted all fields will be validated

It return a array of errors with this shape:

```typescript jsx
interface ValidatorError{
    key: string 
    label: string
    message: string
    value: any
    validatorName: string | undefined //validator name which trigger the error
    path: string
}
```

*e.g.*:
```typescript jsx


const model={
    posts:[{
        post: 'Mi first post',
        tags: ['first','beginner']
    }]
}

const errors2=User.validate(model) 

//[{
// key: 'firstName' 
// label: 'First name'
// message: 'First name is required'
// value: undefined
// validatorName: 'required' 
// path: 'firstName'
// }]

const otherModel={
    firstName: 1,
    posts:[{
        post: 'Mi first post',
        tags: ['first','beginner']
    }]
}

const otherErrors=User.validate(otherModel) 

//[{
// key: 'firstName' 
// label: 'First name'
// message: 'First name must be an string'
// value: 1
// validatorName: 'isString' 
// path: 'firstName'
// }]
```

## 1.2 clean (model: Model, fields = this.getFields()) 

*where*: sever & client

*type*: (model: Model, fields = this.getFields())  : Model

*description*: it function mutate the object trying to convert it to the schema defeinition.

- Forcing the types, firstName is a string, but in the object firstName is a Integer, it will be converted to string, {firstName: 1}=>{firstName: '1'} 
- Removing extra keys, if the object has any property which is not in the schema will be removed
- if the property is not set then de default value in the definition will be assigned.
- if a property in the schema does not exists it will be created with null value (if it does not have default value)

*e.g.*:
```typescript jsx
!inc(user-post-schema-example.md)!

const model={
    firstName: 1,
    posts:[{
    }]
}

const cleanModel=User.clean(model)
//{
//    firstName: '1',
//    posts:[{
//        post: null,
//        tags: []
//    }]
//}
```
    
## 1.1 getPathDefinition


*where*: sever & client

*type*: (key: string): [FieldDefinition](schema-constructor#fieldDefinition) 

*description*: function which take as parameter the field path (dot notation) and return its schema definition

*e.g.*:
```typescript jsx

console.log(User.getPathDefinition('firstName'))

//{
//    validators: ["required"],
//    defaultValue: null,
//    permissions: {
//        read: ["readMyFamilyProfile", "readFamilyProfile", "admin"],
//        create: ["createMyFamilyProfile", "createFamilyProfile", "admin"],
//        update: ["updateMyFamilyProfile", "updateFamilyProfile", "admin"],
//        delete: ["deleteMyFamilyProfile", "deleteFamilyProfile", "admin"]
//    },
//    form: {"col": {"xs": 24, "sm": 12, "md": 12, "lg": 12, "xl": 12, "xxl": 12}},
//    list: {},
//    table: {},
//    label: "First name"
//}
````

    
# 2 Static methods 

## 2.1 getInstance

*where*: sever & client

*type*: (name: string): Schema

*description*: function which takes one parameter, the name of the schema and return the Schema

*e.g.*:

```typescript jsx
import {Schema} from 'mandarina'
const UserSchema=Schema.getInstance('User')
```