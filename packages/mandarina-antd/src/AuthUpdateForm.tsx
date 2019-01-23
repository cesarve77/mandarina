import React from "react"
import {AuthTable} from 'mandarina'
import {FormProps, UpdateForm} from "./Forms";
import {Spin} from "antd";

interface AuthUpdateFormStateProps extends FormProps{
    denied?: JSX.Element
}

export const AuthUpdateForm = ({schema, denied, ...props}: AuthUpdateFormStateProps) => {
    return (
        <AuthTable schema={schema} action='update'>
            {({fields, loading}) => {
                console.log('asl;kjdas',props)
                return (
                    <Spin spinning={loading} style={{width: '100%'}}>
                        {!loading && fields.length > 0 && <UpdateForm schema={schema} {...props} fields={fields}/>}
                        {!loading && !fields || (fields && fields.length === 0) && denied}
                    </Spin>
                );
            }}
        </AuthTable>
    )
}

