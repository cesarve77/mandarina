---
title: Action Form
---

Generate a complete form and take the onSubmit value to perform a [Action](action) at the server

*basic e.g*:
```typescript jsx
import React from 'react'
import {Action} from 'mandarina-antd' 
import ContactForm from '../lib/actions/ContactForm' 

export default ()=><Action schema={ContactForm} actionName='contactForm' result='Boolean!'  />
```

## 1) Properties:

### 1.1) schema
### 1.2) actionName
### 1.3) result
### 1.4) fields
### 1.5) omitFields
### 1.6) omitFieldsRegEx
### 1.7) children
### 1.8) showInlineError
### 1.10) autosaveDelay
### 1.11) autosave
### 1.12) disabled
### 1.13) error
### 1.14) label
### 1.15) model
### 1.16) modelTransform
### 1.17) onChange
### 1.18) onSubmitFailure
### 1.19) onSubmitSuccess
### 1.20) onSubmit
### 1.21) placeholder


*type*: Table

*description*: 

### 1.2) fields?

*type*:string[]

*description*: 

### 1.3) children

*type*: (props: FormChildrenParams) => React.ReactNode | React.ReactNode | React.ReactNode[]

```typescript
interface FormChildrenParams {
    table: Table,
    data: TData
    loading: boolean
    error?: ApolloError
    called?: boolean
    client?: ApolloClient

    [rest: string]: any
}
```

*description*: It can be one of the followings:
* A function which takes as arguments the result of the mutation. See: [MutationChildrenProps]() //todo




showInlineError: boolean

autosaveDelay: number

autosave: boolean


disabled: boolean

error: Error

label: boolean

model: object

modelTransform: (mode: 'form' | 'submit' | 'validate', model: object) => boolean

onChange: (key: string, value: any) => void

onSubmitFailure: () => void

onSubmitSuccess: () => void

onSubmit: (model: object) =>void

placeholder: boolean

ref: (form: object) => void


mutation: DocumentNode;


ignoreResults?: boolean;

optimisticResponse?: Object;

variables?: TVariables;

refetchQueries?: string[] | PureQueryOptions[] | RefetchQueriesProviderFn;

awaitRefetchQueries?: boolean;

update?: MutationUpdaterFn;

onCompleted?: (data: TData) => void;

onError?: (error: ApolloError) => void;

client?: ApolloClient;

context?: Record;
