import React from "react"
import {AuthTable, Schema} from 'mandarina'
import {Spin} from "antd";
import {ColumnProps, ListProps, ListVirtualized} from "./ListVirtualized";
import {FindProps} from "mandarina/build/Operations/Find";

const AuthListComponent = ({schema, denied, Component, ...props}: FindProps & { Component: React.ComponentClass<ListProps, { columns: ColumnProps[], height: number, width: number }>, schema: Schema, denied?: JSX.Element } ) => {
    return (
        <AuthTable schema={schema} action='read'>
            {({fields, loading}) => {
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



// export const AuthList = (props: ColumnProps & FindProps & { schema: Schema, denied?: JSX.Element }) =>
//     <AuthListComponent Component={List} {...props}/>
export const AuthList = (props:  FindProps & { schema: Schema, denied?: JSX.Element }) =>
    <AuthListComponent Component={ListVirtualized} {...props}/>

export const AuthListVirtualized = (props: FindProps & { schema: Schema, denied?: JSX.Element }) =>
    <AuthListComponent Component={ListVirtualized} {...props}/>