import React, {ComponentType} from "react"
import {Auth} from 'mandarina'
import {CreateForm, CreateFormProps, UpdateForm, UpdateFormProps} from "./Forms";
import Spin from "antd/lib/spin";
import {ActionType, AuthChildrenProps, AuthElementsProps} from "mandarina/build/Auth/Auth";
import {ListProps as ListVirtualizedProps, ListVirtualized} from "./List/ListVirtualized";
import {List, ListProps} from "./List/List";

type ElemProps = CreateFormProps | UpdateFormProps | ListVirtualizedProps | ListProps




const AuthAntD = ({Component,innerRef, schema, denied = null, userRoles = [], action, fields: fieldsOri, Error, ...props}:
                      { Component: ComponentType<ElemProps>, action: ActionType } & ElemProps & AuthElementsProps ) => {
    return (
        // @ts-ignore
        <Auth schema={schema} action={action} userRoles={userRoles} fields={fieldsOri}>
            {({fields, loading, error,readFields}: AuthChildrenProps) => {
                if (error && Error) return <Error error={error}/>
                if (!loading && fields && fields.length === 0) return denied
                return (
                    <>
                        {loading && <Spin spinning={loading} style={{width: '100%', height: '100%'}}/>}
                        {!loading && fields && <Component  ref={innerRef} schema={schema} {...props} fields={fields} readFields={readFields}/>}
                    </>
                );
            }}
        </Auth>
    )
}


export const AuthUpdateForm = (props: UpdateFormProps & AuthElementsProps) =>
    <AuthAntD action={'update'} Component={UpdateForm} {...props}/>


export const AuthCreateForm = (props: CreateFormProps & AuthElementsProps) =>
    <AuthAntD action={'create'} Component={CreateForm} {...props}/>


export const AuthList = (props: ListProps & AuthElementsProps) =>
    <AuthAntD action={'read'} Component={List} {...props}/>

export const AuthListVirtualized = (props: ListVirtualizedProps & AuthElementsProps) =>
    <AuthAntD action={'read'} Component={ListVirtualized} {...props}/>
