import React, {ReactChild, ReactElement} from 'react'
import {Create, Schema, Update} from "mandarina";
import AutoForm from "uniforms-antd/AutoForm"
import SubmitField from "uniforms-antd/SubmitField";
import {CreateProps, MutateResultProps, UpdateProps} from "mandarina/build/Operations/Mutate";
import {OperationVariables} from "react-apollo";
import {Bridge} from "./Bridge";
import {filterFields} from "mandarina/build/utils";
//
const ErrorsField: any = require("./uniforms/ErrorsField").default
const AutoFields: any = require("./uniforms/AutoFields").default
const AutoField: any = require("./uniforms/AutoField").default
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

type Component = (props: CreateProps | UpdateProps) => JSX.Element

type FormPropsOmitComponent=Omit<FormProps,'Component'>

export interface CreateFormProps extends  FormPropsOmitComponent{
}

export interface UpdateFormProps extends FormPropsOmitComponent {
    id: string
}

export const CreateForm = React.forwardRef<HTMLFormElement, CreateFormProps>((props: CreateFormProps, ref) =>
    <Form Component={Create} {...props} innerRef={ref}/>)
export const UpdateForm = React.forwardRef<HTMLFormElement, UpdateFormProps>((props: UpdateFormProps, ref) =>
    <Form Component={Update} {...props} innerRef={ref}/>)

export interface AutoFormProps {
    showInlineError?: boolean
    autosaveDelay?: number
    autosave?: boolean
    disabled?: boolean
    error?: Error
    label?: boolean
    model?: object
    modelTransform?: (mode: 'form' | 'submit' | 'validate', model: object) => boolean
    onChange?: (key: string, value: any) => void
    onSubmitFailure?: () => void
    onSubmitSuccess?: () => void
    onSubmit?: (model: object) => Promise<void>
    placeholder?: boolean
    innerRef?: React.Ref<HTMLFormElement>
}

 interface FormProps<TData = any, TVariables = OperationVariables> extends MutateResultProps, AutoFormProps {
    Component: Component
    schema: Schema
    id?: string
    fields?: string[]
    omitFields?: string[]
    omitFieldsRegEx?: RegExp
    children?: ((props: any) => React.ReactNode | React.ReactNode[]) | React.ReactNode | React.ReactNode[]

}

export interface ChildFunc {
    (props: any): JSX.Element
}

const Form = ({
                  Component,
                  fields: optionalFields,
                  schema,
                  innerRef,
                  id,
                  onSubmit,
                  children,
                  showInlineError,
                  autosaveDelay,
                  autosave,
                  disabled,
                  onChange,
                  error,
                  modelTransform,
                  label,
                  omitFields,
                  onSubmitSuccess,
                  onSubmitFailure,
                  omitFieldsRegEx,
                  ...mutationProps
              }: FormProps) => {
    const bridge = new Bridge(schema)
    const fields = filterFields(schema.getFields(), optionalFields, omitFields, omitFieldsRegEx)
    return (
        <Component id={id} schema={schema} fields={fields} {...mutationProps}>
            {({mutate, doc, loading, ...rest}) => {
                return (
                    <AutoForm
                        schema={bridge}
                        model={doc}
                        onSubmit={(model: object) => {
                            onSubmit && onSubmit(model)
                            return mutate(model)
                        }}
                        ref={innerRef}
                        onChange={onChange}
                        modelTransform={modelTransform}
                        autosave={autosave}
                        label={label}
                        error={error}
                        disabled={loading || disabled}
                        showInlineError={showInlineError}
                        autosaveDelay={autosaveDelay}
                        autoField={AutoField}
                        onSubmitSuccess={onSubmitSuccess}
                        onSubmitFailure={onSubmitFailure}
                        onValidate={(model: Object, error: any, callback: any) => {
                            try {
                                bridge.getValidator({fields})(model)
                            } catch (e) {
                                console.error(e)
                                return callback(e)
                            }
                            return callback(null)
                        }}
                    >
                        {children && Array.isArray(children) && children.map((child: ReactElement<ReactChild> | ChildFunc) => {
                            if (typeof child === "function") {
                                return child({doc, loading})
                            }
                            return React.cloneElement(child)
                        })}
                        {children && typeof children !== "function" && children}
                        {children && typeof children === "function" && children({doc, loading, ...rest})}
                        {!children && (
                            <div>
                                <AutoFields autoField={AutoField} fields={fields}/>
                                <ErrorsField style={{marginBottom: '15px'}}/>
                                {!autosave && <SubmitField size='large' loading={loading}/>}
                            </div>)
                        }
                    </AutoForm>
                )
            }}
        </Component>
    )
}