import React from "react"
import {AuthTable, Schema} from 'mandarina'
import {Spin} from "antd";
import {List, ListProps} from "./List";
import {ColumnProps} from 'antd/lib/table';
import {ListVirtualized} from "./ListVirtualized";
import {FindProps} from "mandarina/build/Operations/Find";


const AuthListComponent = ({schema, denied, Component, ...props}: ColumnProps<any> & FindProps & { Component: React.ComponentClass<ListProps, { columns: ColumnProps<any>[] }>, schema: Schema, denied?: JSX.Element }) => {
    return (
        <AuthTable schema={schema} action='read'>
            {({fields, loading}) => {
                if (!loading && Array.isArray(fields)) {
                    fields = fields.filter((field) => !field.match(/\.id$|^id$/))
                }
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


export const AuthList = (props: ColumnProps<any> & FindProps & { schema: Schema, denied?: JSX.Element }) =>
    <AuthListComponent Component={List} {...props}/>


export const AuthListVirtualized = (props: ColumnProps<any> & FindProps & { schema: Schema, denied?: JSX.Element }) =>
    <AuthListComponent Component={ListVirtualized} {...props}/>