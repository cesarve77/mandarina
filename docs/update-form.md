---
title: Update Form
---

Generate a complete form to update the table


table: Table
id: string
fields?: string[]
children: (props: any) => React.ReactNode | React.ReactNode | React.ReactNode[]
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

[prop: string]: any

mutation: DocumentNode;
ignoreResults?: boolean;
optimisticResponse?: Object;
variables?: TVariables;
refetchQueries?: Array<string | PureQueryOptions> | RefetchQueriesProviderFn;
awaitRefetchQueries?: boolean;
update?: MutationUpdaterFn<TData>;
onCompleted?: (data: TData) => void;
onError?: (error: ApolloError) => void;
client?: ApolloClient<Object>;
context?: Record<string, any>;