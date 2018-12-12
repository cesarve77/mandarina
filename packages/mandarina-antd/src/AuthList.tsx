import React from "react"
import {AuthTable, Table} from 'mandarina'
import {Spin} from "antd";
import {List} from "./List";


export const AuthList = ({table,denied, ...props}: { table: Table, denied?: JSX.Element }) => {
    return (
        <AuthTable table={table} action='read'>
            {({fields, loading}) => {
                return (
                    <Spin spinning={loading} style={{width:'100%'}}>
                        {!loading && fields && fields.length>0 && <List table={table} {...props} fields={fields}/>}
                        {!loading && !fields || (fields && fields.length===0) && denied}
                    </Spin>
                );
            }}
        </AuthTable>
    )
}


