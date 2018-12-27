import React from "react"
import {AuthTable, Schema} from 'mandarina'
import {Spin} from "antd";
import {List, ListProps} from "./List";
import {ColumnProps} from 'antd/lib/table';
import {ListVirtualized} from "./ListVirtualized";


const AuthListComponent = ({schema, denied, Component, ...props}: ColumnProps<any> & { Component: React.ComponentClass<ListProps, { columns: ColumnProps<any>[] }>, schema: Schema, denied?: JSX.Element }) => {
    return (
        <AuthTable schema={Schema} action='read'>
            {({fields, loading}) => {
                console.log('fields, loading', fields, loading)
                return (
                    <Spin spinning={loading} style={{width: '100%'}}>
                        {!loading && fields && fields.length > 0 &&
                        <Component schema={schema} {...props} fields={fields}/>}
                        {!loading && !fields || (fields && fields.length === 0) && denied}
                    </Spin>
                );
            }}
        </AuthTable>
    )
}


export const AuthList = (props: ColumnProps<any> & { schema: Schema, denied?: JSX.Element }) =>
    <AuthListComponent Component={List} {...props}/>


export const AuthListVirtualized = (props: ColumnProps<any> & { schema: Schema, denied?: JSX.Element }) =>
    <AuthListComponent Component={ListVirtualized} {...props}/>