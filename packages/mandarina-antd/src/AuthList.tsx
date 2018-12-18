import React from "react"
import {AuthTable, Table} from 'mandarina'
import {Spin} from "antd";
import {List, ListProps} from "./List";
import {ColumnProps} from 'antd/lib/table';
import {ListVirtualized} from "./ListVirtualized";


const AuthListComponent = ({table, denied, Component, ...props}: ColumnProps<any> & { Component: React.ComponentClass<ListProps, { columns: ColumnProps<any>[] }>, table: Table, denied?: JSX.Element }) => {
    return (
        <AuthTable table={table} action='read'>
            {({fields, loading}) => {
                console.log('fields, loading', fields, loading)
                return (
                    <Spin spinning={loading} style={{width: '100%'}}>
                        {!loading && fields && fields.length > 0 &&
                        <Component table={table} {...props} fields={fields}/>}
                        {!loading && !fields || (fields && fields.length === 0) && denied}
                    </Spin>
                );
            }}
        </AuthTable>
    )
}


export const AuthList = (props: ColumnProps<any> & { table: Table, denied?: JSX.Element }) =>
    <AuthListComponent Component={List} {...props}/>


export const AuthListVirtualized = (props: ColumnProps<any> & { table: Table, denied?: JSX.Element }) =>
    <AuthListComponent Component={ListVirtualized} {...props}/>