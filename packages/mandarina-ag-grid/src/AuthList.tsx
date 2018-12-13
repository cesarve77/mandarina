import React from "react"
import {AuthTable, Table} from 'mandarina'
import {List} from "./List";


const Spin=({children,spinning}:{children:any,  spinning?: boolean})=>spinning && 'loading' || children

export const AuthList = ({table,denied, ...props}: { table: Table, denied?: JSX.Element }) => {
    return (
        <AuthTable table={table} action='read'>
            {({fields, loading}) => {
                return (
                    <Spin spinning={!!loading} >
                        {!loading && fields && fields.length>0 && <List table={table} {...props} fields={fields}/>}
                        {!loading && !fields || (fields && fields.length===0) && denied}
                    </Spin>
                );
            }}
        </AuthTable>
    )
}



