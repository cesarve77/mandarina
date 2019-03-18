---
title: Create Form
---

Generate a form to create a new record for a given  table

*basic e.g*:
```typescript jsx
import React from 'react'
import {CreateForm} from 'mandarina-antd' 
import Post from '../../lib/schemas/Post' 

const CreatPostForm=()=><CreateForm schema={Post} />
```

## 1) Properties:

### 1.1) schema
### 1.2) fields
### 1.3) omitFields
### 1.4) omitFieldsRegEx

### 1.5) children

*type*:  (({doc, any, loading:boolean}) => React.ReactNode | React.ReactNode[]) | React.ReactNode | React.ReactNode[] | 

*default*: it passed :

1. AutoFields to render all fields 
2. ErrorsField to render all errors 
3. SubmitField to render a submit button

```typescript jsx
import {AutoFields,AutoField,ErrorsField,SubmitField} from 'mandarina-antd'
 ...
<div>
    <AutoFields autoField={AutoField}/>
    <ErrorsField />
    <SubmitField size='large'/>
</div>
```

*description*: children can be a function or a ReactChild

if it is a function it takes 1 object as param with the following properties

1. doc: the model
2. loading: indicating when the request is on the fly

and should return your custom AutoForm children see: [AutoForm](https://github.com/vazco/uniforms/blob/master/INTRODUCTION.md#quick-start)

or pass your custom AutoForm children if you don't care about loading param

### 1.6) showInlineError

### 1.7) autosaveDelay

### 1.8) autosave

### 1.9) disabled

### 1.10) error
*type*: Error
see: !inc(links/auto-form.md)!

### 1.11) label
*type*: boolean
see: !inc(links/auto-form.md)!

### 1.12) model

### 1.13) modelTransform

### 1.14) onChange

### 1.15) onSubmitFailure

### 1.16) onSubmitSuccess

### 1.17) onSubmit

### 1.18) placeholder

### 1.19) ref

### 1.20) client
!inc(links/mutation-props.md)!
### 1.21) variables
!inc(links/mutation-props.md)!
### 1.22) update
!inc(links/mutation-props.md)!
### 1.23) ignoreResults
!inc(links/mutation-props.md)!
### 1.24) optimisticResponse
!inc(links/mutation-props.md)!
### 1.25) refetchQueries
!inc(links/mutation-props.md)!
### 1.26) awaitRefetchQueries
!inc(links/mutation-props.md)!
### 1.27) onCompleted
!inc(links/mutation-props.md)!
### 1.28) onError
!inc(links/mutation-props.md)!
### 1.29) context
!inc(links/mutation-props.md)!
### 1.30) fetchPolicy
!inc(links/mutation-props.md)!

