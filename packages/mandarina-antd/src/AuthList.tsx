import React from "react"
import {AuthTable, Table} from 'mandarina'
import {Spin} from "antd";
import {ListVirtualized} from "./List";
import { ColumnProps } from 'antd/lib/table';

export const AuthList = ({table,denied, ...props}: ColumnProps<any> & { table: Table, denied?: JSX.Element} ) => {
    return (
        <AuthTable table={table} action='read'>
            {({fields, loading}) => {
                console.log('fields, loading',fields, loading)
                return (
                    <Spin spinning={loading} style={{width:'100%'}}>
                        {!loading && fields && fields.length>0 && <ListVirtualized table={table} {...props} fields={fields}/>}
                        {!loading && !fields || (fields && fields.length===0) && denied}
                    </Spin>
                );
            }}
        </AuthTable>
    )
}


