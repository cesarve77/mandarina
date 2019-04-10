import React, {ElementType, ReactNode} from "react"
import {Auth} from 'mandarina'
import {CreateForm, CreateFormProps, UpdateForm, UpdateFormProps} from "./Forms";
import {Spin} from "antd";
import {AuthChildrenProps} from "mandarina/build/Auth/Auth";
import {ListProps, ListVirtualized} from "./ListVirtualized";
import {List} from "./List";
import {FindProps} from "mandarina/build/Operations/Find";

type ElemProps = CreateFormProps | UpdateFormProps | ListProps

export interface AuthElementsProps {
    denied?: ReactNode
    Error?: ElementType<{ error: Error }>
    Component: ElementType<ElemProps>
    userRoles: string[]
}


const AuthAntD = ({Component, schema, denied = null, userRoles, fields: optionalFields, omitFields, omitFieldsRegEx, Error, ...props}: ElemProps & AuthElementsProps) => {
    return (
        <Auth schema={schema} action='create' userRoles={userRoles} fields={optionalFields} omitFields={omitFields}
              omitFieldsRegEx={omitFieldsRegEx}>
            {({fields, loading, error}: AuthChildrenProps) => {
                if (error && Error) return <Error error={error}/>
                if (!loading && fields && fields.length === 0) return denied
                return (
                    <Spin spinning={loading} style={{width: '100%'}}>
                        {!loading && fields && <Component schema={schema} {...props} fields={fields}/>}
                    </Spin>
                );
            }}
        </Auth>
    )
}


export const AuthUpdateForm = (props: UpdateFormProps & AuthElementsProps) =>
    <AuthAntD Component={UpdateForm} {...props}/>


export const AuthCreateForm = (props: CreateFormProps & AuthElementsProps) =>
    <AuthAntD Component={CreateForm} {...props}/>


export const AuthList = (props: FindProps & AuthElementsProps) =>
    <AuthAntD Component={List} {...props}/>

export const AuthListVirtualized = (props: FindProps & AuthElementsProps) =>
    <AuthAntD Component={ListVirtualized} {...props}/>