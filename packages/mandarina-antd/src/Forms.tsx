import React, {ReactElement, useEffect, useMemo} from 'react'
import {Create, Schema, Update} from "mandarina";
import AutoForm from "uniforms-antd/AutoForm"
import SubmitField from "uniforms-antd/SubmitField";
import {CreateProps, Delete, MutateChildren, MutateResultProps, UpdateProps} from "mandarina/build/Operations/Mutate";
import {OperationVariables} from "react-apollo";
import {Bridge} from "./Bridge";
import {Model, Overwrite} from "mandarina/build/Schema/Schema";
//
const ErrorsField: any = require("./uniforms/ErrorsField").default
const AutoFields: any = require("./uniforms/AutoFields").default
const AutoField: any = require("./uniforms/AutoField").default
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

type Component = (props: CreateProps | UpdateProps) => ReactElement

type FormPropsOmitComponent = Omit<FormProps, 'Component'>

export interface CreateFormProps extends FormPropsOmitComponent {
    ref?: React.Ref<HTMLFormElement>
}

export interface UpdateFormProps extends FormPropsOmitComponent {
    id: string | any
    readFields?: string[]
    ref?: React.Ref<HTMLFormElement>

}

export interface DeleteFormProps extends FormPropsOmitComponent {
    id: string
    ref?: React.Ref<HTMLFormElement>
}


export const CreateForm = React.forwardRef<HTMLFormElement, CreateFormProps>((props: CreateFormProps, ref) =>
    <Form Component={Create} {...props} innerRef={ref}/>)
export const UpdateForm = React.forwardRef<HTMLFormElement, UpdateFormProps>(({fields, readFields = fields, ...props}: UpdateFormProps, ref) => {
    const Component = useMemo(() =>({children, id, ...props}: Omit<FormProps, 'children'> & { children: MutateChildren }) =>{
        return <Update {...props} fields={readFields} id={id} children={children}/>
    },[readFields.join()])
    return <Form Component={Component} fields={fields} {...props} innerRef={ref}/>;
})
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
    onValidate?: (model: any, error: Error, callback: ()=>void) => void
    onChangeModel?: (model: Model) => void
    onSubmit?: (model: Model) => Promise<void> | void
    placeholder?: boolean
    innerRef?: React.Ref<HTMLFormElement>
    style?: any //todo encontrar el correcto
    validate?: 'onChange' | 'onChangeAfterSubmit' | 'onSubmit'
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
    (props: any): ReactElement
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
                  onValidate,
                  onSubmitFailure,
                  onChangeModel,
                  overwrite,
                  style,
                  validate,
                  ...mutationProps
              }: FormProps) => {
    const bridge = new Bridge(schema, fields, overwrite)
    const isDelete = Component === Delete
    const allFields = isDelete ? [] : fields
    return (
        <Component id={id} schema={schema} fields={allFields} {...mutationProps}>
            {({mutate, doc = model, loading, called, ...rest}) => {
                return (
                    <AutoForm
                        key={id && doc && 'key'} //insurance rerender when is a update and doc arrive
                        schema={bridge}
                        model={doc}
                        onSubmit={(model: any) => {
                            schema.clean(model,allFields)// fill null all missing keys
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
                        onValidate={onValidate}
                        style={style}
                        validate={validate}
                    >

                        {children && typeof children !== "function" && children}
                        {children && typeof children === "function" && children({doc, loading, called, ...rest, fields})}
                        {!children && (
                            <>
                                <AutoFields autoField={AutoField} fields={fields}/>
                                <ErrorsField style={{marginBottom: '15px'}}/>
                                {!autosave && <SubmitField value={'Save'} size='large' loading={loading}/>}
                            </>)
                        }
                    </AutoForm>
                )
            }}
        </Component>
    )
}
