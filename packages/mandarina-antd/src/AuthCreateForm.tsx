import React from "react"
import {AuthTable, Schema} from 'mandarina'
import {CreateForm} from "./Forms";
import {Spin} from "antd";

interface AuthUpdateFormStateProps {
    schema: Schema | string
    denied?: JSX.Element

}


export const AuthCreateForm = ({schema, denied, ...props}: AuthUpdateFormStateProps) => {
    return (
        <AuthTable schema={schema} action='create'>
            {({fields, loading}) => (
                <Spin spinning={loading} style={{width: '100%'}}>
                    {!loading && fields.length>0 && <CreateForm schema={schema} {...props} fields={fields}/>}
                    {!loading && !fields || (fields && fields.length===0) && denied}
                </Spin>
            )}
        </AuthTable>
    )
}

