---
title: Create Form
---

Generate a complete form to create a nre record to the given  table

*basic e.g*:
```typescript jsx
import React from 'react'
import {CreateForm} from 'mandarina-antd' 
import Post from '../Post' 

const CreatPostForm=()=><CreateForm table={Post} />
```

## 1) Properties:

### 1.1) table

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
