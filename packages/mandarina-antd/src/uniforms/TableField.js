import {Query} from "react-apollo";
import React from "react";
import gql from "graphql-tag";
import isEmpty from 'lodash.isempty'
import SelectField from "uniforms-antd/SelectField";

const defaultExtractor = (data) => {
    if (isEmpty(data)) return []
    const queryName = Object.keys(data)[0]
    const docs = data[queryName]
    return docs.map((doc) => {
        const keys = Object.keys(doc)
        const value = doc[keys[0]]
        const label = getFirstProperty(doc[keys[1]])
        return {value, label}
    })
}

const getFirstProperty = (obj) => {
    if (!obj) return ''
    if (typeof obj === 'string') return obj
    const keys = Object.keys(obj)
    if (!keys[0]) return ''
    if (obj[keys[0]] === 'object') {
        return getFirstProperty(obj[keys[0]])
    } else {
        return obj[keys[0]]
    }
}

export default ({query, extractor = defaultExtractor, ...props}) => {
    if (typeof query === 'string') {
        const QUERY = gql(`query docs{ ${query} }`)
        return (
            <Query query={QUERY}>
                {({loading, error, data, variables, refetch}) => {
                    if (error) return <Error variables={variables} error={error} refetch={refetch}/> //todo create ERROR component
                    const options = extractor(data)
                    return <SelectField {...props}
                                        options={options}
                                        placeholder={props.loading ? '.... ... .. .' : props.placeholder}
                                        disabled={loading || props.disabled}
                                        onChange={value => props.onChange({id: value})}
                                        value={props.fieldType === Array ? props.value || [] : '' + (props.value && props.value.id || '')}
                    />
                }}
            </Query>
        )
    } else {

    }
}
