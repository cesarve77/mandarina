---
title: Create Form
---

Generate a form to update a record by Id for a given table

*basic e.g*:
```typescript jsx
import React from 'react'
import {CreateForm} from 'mandarina-antd' 
import Post from '../../lib/schemas/Post' 

const CreatPostForm=()=><CreateForm schema={Post} />
```

## 1) Properties:

### 1.1) schema
### 1.2) id
### 1.3) fields
### 1.4) omitFields
### 1.5) omitFieldsRegEx

### 1.5) children

*type*:  (({doc, any, loading:boolean}) => React.ReactNode | React.ReactNode[]) | React.ReactNode | React.ReactNode[] | 

*default*: it passed :

1. AutoFields to render all fields 
2. ErrorsField to render all errors 
3. SubmitField to render a submit button

```typescript jsx
import {AutoFields,AutoField,ErrorsField,SubmitField} from 'mandarina-antd'
 
<div>
    <AutoFields autoField={AutoField}/>
    <ErrorsField />
    <SubmitField size='large'/>}
</div>
```

*description*: children can be a function or a ReactChild

if it is a function it takes 1 object as param with the following properties

1. doc: the model
2. loading: indicating when the request is on the fly

and should return your custom AutoForm children see: [AutoForm](https://github.com/vazco/uniforms/blob/master/INTRODUCTION.md#quick-start)

or pass your custom AutoForm children if you don't care about loading param


### 1.7) showInlineError

### 1.8) autosaveDelay

### 1.9) autosave

### 1.10) disabled

### 1.11) error
*type*: Error
see: !inc(links/auto-form.md)!

### 1.12) label
*type*: boolean
see: !inc(links/auto-form.md)!

### 1.13) model

### 1.14) modelTransform

### 1.15) onChange

### 1.16) onSubmitFailure

### 1.17) onSubmitSuccess

### 1.18) onSubmit

### 1.19) placeholder

### 1.20) ref

### 1.21) client
!inc(links/mutation-props.md)!
### 1.22) variables
!inc(links/mutation-props.md)!
### 1.23) update
!inc(links/mutation-props.md)!
### 1.24) ignoreResults
!inc(links/mutation-props.md)!
### 1.25) optimisticResponse
!inc(links/mutation-props.md)!
### 1.26) refetchQueries
!inc(links/mutation-props.md)!
### 1.27) awaitRefetchQueries
!inc(links/mutation-props.md)!
### 1.28) onCompleted
!inc(links/mutation-props.md)!
### 1.29) onError
!inc(links/mutation-props.md)!
### 1.30) context
!inc(links/mutation-props.md)!
### 1.30) fetchPolicy
!inc(links/mutation-props.md)!

