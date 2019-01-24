import React, {ReactChild, ReactElement} from 'react'
import {Create, Schema, Update} from "mandarina";
import AutoForm from "uniforms-antd/AutoForm"
import SubmitField from "uniforms-antd/SubmitField";
import {CreateProps, UpdateProps} from "mandarina/build/Operations/Mutate";
import {MutationUpdaterFn, OperationVariables, RefetchQueriesProviderFn} from "react-apollo";
import {DocumentNode} from "graphql";
import ApolloClient, {ApolloError, PureQueryOptions} from "apollo-client";
import {Bridge} from "./Bridge";
import {filterFields} from "mandarina/build/utils";
//
const ErrorsField: any = require("./uniforms/ErrorsField").default
const AutoFields: any = require("./uniforms/AutoFields").default
const AutoField: any = require("./uniforms/AutoField").default

export const CreateForm = (props: any) => <Form Component={Create} {...props}/>
export const UpdateForm = (props: any) => <Form Component={Update} {...props}/>


export interface FormProps<TData = any, TVariables = OperationVariables> {
    Component: (props: CreateProps | UpdateProps) => JSX.Element
    schema: Schema
    id: string
    fields?: string[]
    omitFields?: string[]
    omitFieldsRegEx?: RegExp
    children: (FormChildrenParams: any) => React.ReactNode | React.ReactNode | React.ReactNode[]
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
    onSubmit: (model: object) => void
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

const Form = ({Component, fields: optionalFields, schema, id, onSubmit, children, showInlineError, omitFields, omitFieldsRegEx, ...props}: FormProps) => {
    const bridge = new Bridge(schema)
    console.log('fields111', optionalFields, omitFields, omitFieldsRegEx)
    const fields = filterFields(optionalFields || schema.getFields(), omitFields, omitFieldsRegEx)
    console.log('fields222', fields)
    return (
        <Component id={id} schema={schema} fields={fields}>
            {({mutate, doc, loading, ...rest}) => {
                return (
                    <AutoForm
                        schema={bridge}
                        model={doc}
                        onSubmit={(model: object) => {
                            onSubmit && onSubmit(model)
                            return mutate(model)
                        }}
                        disabled={loading}
                        showInlineError={showInlineError}
                        autoField={AutoField}
                        onValidate={(model: Object, error: any, callback: any) => {
                            try{
                                bridge.getValidator({fields})(model)
                            }catch (e) {
                                console.log('e',e)
                                return callback(e)
                            }
                            callback(null)
                        }}
                        {...props}
                    >
                        {children && Array.isArray(children) && children.map((child: ReactElement<ReactChild> | ChildFunc) => {
                            if (typeof child === "function") {
                                return child({doc, loading, ...props})
                            }
                            return React.cloneElement(child)
                        })}
                        {children && typeof children === "function" && children({doc, loading, ...rest, ...props})}
                        {children && typeof children !== "function" && React.cloneElement(children)}
                        {!children && (
                            <div>
                                <AutoFields autoField={AutoField} fields={fields}/>
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