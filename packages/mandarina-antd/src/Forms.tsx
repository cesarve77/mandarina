import React from 'react'
import {Create, Schema, Update} from "mandarina";
import AutoForm from "uniforms-antd/AutoForm"
import SubmitField from "uniforms-antd/SubmitField";
import {CreateProps, MutateResultProps, UpdateProps} from "mandarina/build/Operations/Mutate";
import {OperationVariables} from "react-apollo";
import {Bridge} from "./Bridge";
import {ensureId, filterFields} from "mandarina/build/utils";
import {Model, Overwrite} from "mandarina/build/Schema/Schema";
//
const ErrorsField: any = require("./uniforms/ErrorsField").default
const AutoFields: any = require("./uniforms/AutoFields").default
const AutoField: any = require("./uniforms/AutoField").default
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

type Component = (props: CreateProps | UpdateProps) => JSX.Element

type FormPropsOmitComponent = Omit<FormProps, 'Component'>

export interface CreateFormProps extends FormPropsOmitComponent {
}

export interface UpdateFormProps extends FormPropsOmitComponent {
    id: string | any
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
    onSubmitFailure?: (e?: any) => void
    onSubmitSuccess?: (res?: any) => void
    onChangeModel?: (model: Model) => void
    onSubmit?: (model: object) => Promise<void> | void
    placeholder?: boolean
    innerRef?: React.Ref<HTMLFormElement>
}


interface FormProps<TData = any, TVariables = OperationVariables> extends MutateResultProps, AutoFormProps {
    Component: Component
    schema: Schema
    id?: string | any
    fields?: string[]
    overwrite?: Overwrite
    omitFields?: string[]
    omitFieldsRegEx?: RegExp
    children?: ((props: any) => React.ReactNode | React.ReactNode[]) | React.ReactNode | React.ReactNode[]

}

export interface ChildFunc {
    (props: any): JSX.Element
}


/**
 * If a fields is Table and the form is query, it'll remove all subfields diferents to id
 * @param fields
 * @param schema
 * @param overwrite
 */
export const normalizeFields = (fields: string[], schema: Schema, overwrite?: Overwrite) => {
    const tables: string[] = []
    const result: string[] = []
    fields.forEach((field) => {
        if (field.match(/\.id$/)) {
            const parent = field.substr(0, field.length - 3)
            const def = schema.getPathDefinition(parent)
            // @ts-ignore
            const query = (overwrite && overwrite[field] && overwrite[field].form && overwrite[field].form.props && overwrite[field].form.props.query) || (def && def.form && def.form.props && def.form.props.query)
            if (query) tables.push(parent.replace(/\./, '\\.'))
        }
        result.push(field)
    })
    if (tables.length===0) return result
    const rg = new RegExp(`^(${tables.join('|')})\\.(?!id$).*`)
    return result.filter((field) => !rg.test(field))
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
                  model,
                  disabled,
                  onChange,
                  error,
                  modelTransform,
                  label,
                  omitFields,
                  onSubmitSuccess,
                  onSubmitFailure,
                  omitFieldsRegEx,
                  onChangeModel,
                  overwrite,
                  ...mutationProps
              }: FormProps) => {
    const bridge = new Bridge(schema, overwrite)
    const AllFields = ensureId(filterFields(schema.getFields(), optionalFields, omitFields, omitFieldsRegEx))

    const fields = normalizeFields(AllFields, schema, overwrite)
    return (
        <Component id={id} schema={schema} fields={fields} {...mutationProps}>
            {({mutate, doc = model, loading, ...rest}) => {
                doc && schema.clean(doc,fields)
                return (
                    <AutoForm
                        schema={bridge}
                        model={doc}
                        onSubmit={(model: object) => {
                            onSubmit && onSubmit(model)
                            return mutate(model)
                        }}
                        onChangeModel={onChangeModel}
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

                        {children && typeof children !== "function" && children}
                        {children && typeof children === "function" && children({doc, loading, ...rest})}
                        {!children && (
                            <>
                                <AutoFields autoField={AutoField} fields={fields}/>
                                <ErrorsField style={{marginBottom: '15px'}}/>
                                {!autosave && <SubmitField size='large' loading={loading}/>}
                            </>)
                        }
                    </AutoForm>
                )
            }}
        </Component>
    )
}