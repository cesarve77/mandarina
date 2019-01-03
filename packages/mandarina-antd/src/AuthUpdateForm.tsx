import React from "react"
import {AuthTable, Schema} from 'mandarina'
import {UpdateForm} from "./Forms";
import {Spin} from "antd";

interface AuthUpdateFormStateProps {
    schema: Schema | string
    denied?: JSX.Element
}

export const AuthUpdateForm = ({schema, denied, ...props}: AuthUpdateFormStateProps) => {
    return (
        <AuthTable schema={schema} action='update'>
            {({fields, loading}) => (
                <Spin spinning={loading} style={{width: '100%'}}>
                    {!loading && fields.length>0 && <UpdateForm schema={schema} {...props} fields={fields}/>}
                    {!loading && !fields || (fields && fields.length===0) && denied}
                </Spin>
            )}
        </AuthTable>
    )
}

