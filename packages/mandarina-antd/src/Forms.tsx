import React from 'react'
import {Create, Schema, Update} from "mandarina";
import AutoForm from "uniforms-antd/AutoForm"
import SubmitField from "uniforms-antd/SubmitField";
import {CreateProps, Delete, MutateResultProps, UpdateProps} from "mandarina/build/Operations/Mutate";
import {OperationVariables} from "react-apollo";
import {Bridge} from "./Bridge";
import {Model, Overwrite} from "mandarina/build/Schema/Schema";
//
const ErrorsField: any = require("./uniforms/ErrorsField").default
const AutoFields: any = require("./uniforms/AutoFields").default
const AutoField: any = require("./uniforms/AutoField").default
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

type Component = (props: CreateProps | UpdateProps) => JSX.Element

type FormPropsOmitComponent = Omit<FormProps, 'Component'>

export interface CreateFormProps extends FormPropsOmitComponent {
    ref?: React.Ref<HTMLFormElement>
}

export interface UpdateFormProps extends FormPropsOmitComponent {
    id: string | any
    ref?: React.Ref<HTMLFormElement>

}

export interface DeleteFormProps extends FormPropsOmitComponent {
    id: string
    ref?: React.Ref<HTMLFormElement>
}


export const CreateForm = React.forwardRef<HTMLFormElement, CreateFormProps>((props: CreateFormProps, ref) =>
    <Form Component={Create} {...props} innerRef={ref}/>)
export const UpdateForm = React.forwardRef<HTMLFormElement, UpdateFormProps>((props: UpdateFormProps, ref) =>
    <Form Component={Update} {...props} innerRef={ref}/>)
export const DeleteForm = React.forwardRef<HTMLFormElement, DeleteFormProps>((props: DeleteFormProps, ref) =>
    <Form Component={Delete} {...props} innerRef={ref}/>)

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
    style?: any //todo encontrar el correcto
}


interface FormProps<TData = any, TVariables = OperationVariables> extends MutateResultProps, AutoFormProps {
    Component: Component
    schema: Schema
    id?: string | any
    fields: string[]
    overwrite?: Overwrite
    children?: ((props: any) => React.ReactNode | React.ReactNode[]) | React.ReactNode | React.ReactNode[]

}

export interface ChildFunc {
    (props: any): JSX.Element
}


// /**
//  * If a fields is Table and the form is query, it'll remove all subfields diferents to id
//  * @param fields
//  * @param schema
//  * @param overwrite
//  */
// export const normalizeFields = (fields: string[], schema: Schema, overwrite?: Overwrite) => {
//     const tables: string[] = []
//     const result: string[] = []
//     fields.forEach((field) => {
//         if (field.match(/\.id$/)) {
//             const parent = field.substr(0, field.length - 3)
//             const def = schema.getPathDefinition(parent)
//             // @ts-ignore
//             const query = (overwrite && overwrite[field] && overwrite[field].form && overwrite[field].form.props && overwrite[field].form.props.query) || (def && def.form && def.form.props && def.form.props.query)
//             if (query) tables.push(parent.replace(/\./, '\\.'))
//         }
//         result.push(field)
//     })
//     if (tables.length === 0) return result
//     const rg = new RegExp(`^(${tables.join('|')})\\.(?!id$).*`)
//     return result.filter((field) => !rg.test(field))
// }


const Form = ({
                  Component,
                  fields,
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
                  onSubmitSuccess,
                  onSubmitFailure,
                  onChangeModel,
                  overwrite,
                  style,
                  ...mutationProps
              }: FormProps) => {
    const bridge = new Bridge(schema, fields,overwrite)
    const isDelete = Component === Delete
    const AllFields = isDelete ? [] : fields
    return (
        <Component id={id} schema={schema} fields={AllFields} {...mutationProps}>
            {({mutate, doc = model, loading, ...rest}) => {
                doc && schema.clean(doc, AllFields)
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
                        style={style}
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
