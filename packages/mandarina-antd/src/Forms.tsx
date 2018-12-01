import React, {ReactChild, ReactElement} from 'react'
import {Create, Table, Update} from "mandarina";
import AutoForm from "uniforms-antd/AutoForm"
import SubmitField from "uniforms-antd/SubmitField";
import {CreateProps, UpdateProps} from "mandarina/build/Operations/Mutate";
import {MutationUpdaterFn, OperationVariables, RefetchQueriesProviderFn} from "react-apollo";
import {DocumentNode} from "graphql";
import ApolloClient, {ApolloError, PureQueryOptions} from "apollo-client";
import {Bridge} from "./Bridge";
//
const ErrorsField: any = require("./uniforms/ErrorsField").default
const AutoFields: any = require("./uniforms/AutoFields").default
const AutoField: any = require("./uniforms/AutoField").default

export const CreateForm = (props: any) => <Form Component={Create} {...props}/>
export const UpdateForm = (props: any) => <Form Component={Update} {...props}/>


export interface FormProps<TData = any, TVariables = OperationVariables> {
    Component: (props: CreateProps | UpdateProps) => JSX.Element
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
}

export interface ChildFunc {
    (props: any): JSX.Element
}

const Form = ({Component, fields, table, id, onSubmit, children, showInlineError, omitFields, ...props}: FormProps) => {
    const schema = new Bridge(table)
    return (
        <Component id={id} table={table}>
            {({mutate, doc, loading, ...rest}) => {
                return (
                    <AutoForm
                        schema={schema}
                        model={doc}
                        onSubmit={(model: object) => {
                            onSubmit && onSubmit(model)
                            return mutate(model)
                        }}
                        disabled={loading}
                        showInlineError={showInlineError}
                        autoField={AutoField}
                        {...props}
                    >
                        {children && Array.isArray(children) && children.map((child: ReactElement<ReactChild> | ChildFunc) => {
                            if (typeof  child === "function") {
                                return child({doc, loading, ...props})
                            }
                            return React.cloneElement(child)
                        })}
                        {children && typeof  children === "function" && children({doc, loading, ...props})}
                        {children && typeof  children !== "function" && React.cloneElement(children)}
                        {!children && (
                            <div>
                                <AutoFields autoField={AutoField} fields={fields} omitFields={omitFields}/>
                                <ErrorsField style={{marginBottom: '15px'}}/>
                                <SubmitField size='large' loading={loading}/>
                            </div>)
                        }
                    </AutoForm>
                )
            }}
        </Component>
    )
}