import React from "react"
import {AuthTable, Table} from 'mandarina'
import {UpdateForm} from "./Forms";
import {Spin} from "antd";

interface AuthUpdateFormStateProps {
    table: Table | string
    denied?: JSX.Element
}

export const AuthUpdateForm = ({table, denied, ...props}: AuthUpdateFormStateProps) => {
    return (
        <AuthTable table={table} action='update'>
            {({fields, loading}) => (
                <Spin spinning={loading} style={{width: '100%'}}>
                    {!loading && fields.length>0 && <UpdateForm table={table} {...props} fields={fields}/>}
                    {!loading && !fields || (fields && fields.length===0) && denied}
                </Spin>
            )}
        </AuthTable>
    )
}

