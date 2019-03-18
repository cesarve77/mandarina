import React from "react"
import {AuthTable} from 'mandarina'
import {CreateForm, CreateFormProps} from "./Forms";
import {Spin} from "antd";

interface AuthUpdateFormStateProps {
    denied?: JSX.Element

}


export const AuthCreateForm = ({schema, denied, fields: optionalFields, omitFields, omitFieldsRegEx, ...props}: CreateFormProps & AuthUpdateFormStateProps) => {
    return (
        <AuthTable schema={schema} action='create' fields={optionalFields} omitFields={omitFields}
                   omitFieldsRegEx={omitFieldsRegEx}>
            {({fields, loading}) => (
                <Spin spinning={loading} style={{width: '100%'}}>
                    {!loading && fields.length > 0 && <CreateForm schema={schema} {...props} fields={fields}/>}
                    {!loading && !fields || (fields && fields.length === 0) && denied}
                </Spin>
            )}
        </AuthTable>
    )
}

