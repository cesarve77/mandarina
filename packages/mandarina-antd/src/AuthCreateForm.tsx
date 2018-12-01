import React from "react"
import {AuthTable, Table} from 'mandarina'
import {CreateForm} from "./Forms";
import {Spin} from "antd";

interface AuthUpdateFormStateProps {
    table: Table | string
    denied?: JSX.Element

}

export const AuthCreateForm = ({table, denied, ...props}: AuthUpdateFormStateProps) => {
    return (
        <AuthTable table={table} action='create'>
            {({fields, loading}) => (
                <Spin spinning={loading} style={{width: '100%'}}>
                    {!loading && fields.length>0 && <CreateForm table={table} {...props} fields={fields}/>}
                    {!loading && !fields || (fields && fields.length===0) && denied}
                </Spin>
            )}
        </AuthTable>
    )
}

