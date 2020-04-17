import {Query} from "react-apollo";
import React from "react";
import gql from "graphql-tag";
import SelectField from "uniforms-antd/SelectField";
import {Spin} from "antd";
import {Schema} from 'mandarina'
import connectField from "uniforms/connectField";
import {isEmpty} from "lodash";

const defaultLabeler = (doc) => {
    const clone = {...doc}
    const id = clone.id
    delete clone.id
    delete clone.__typename
    return joinValues(clone, id)

}
const getTransform = (docs, labeler) => {
    if (!Array.isArray(docs) || docs.length === 0) return (id) => id
    const mapper = {}
    docs.forEach((doc) => {
        mapper[doc.id] = labeler(doc)
    })

    return (id) => mapper[id] && mapper[id].toString()
}


export const joinValues = (obj, defaultValue, divider = ' ') => {
    if (!obj) return defaultValue
    if (typeof obj === 'string') return obj
    const keys = Object.keys(obj)
    if (!keys[0]) return defaultValue
    const result = []
    keys.forEach((key) => {
        if (obj[key] === 'object') {
            return result.push(joinValues(obj[key]))
        } else {
            return result.push(obj[key])
        }
    })
    return result.join(divider)
}


const Table = ({query, where, mode, labeler = defaultLabeler, ...props}) => {
    const table = (props && props.type) || props.field.type
    if (typeof query === 'string') {
        const schema = Schema.getInstance(table)
        const queryName = schema.names.query.plural
        const inputName = schema.names.input.where.plural
        const QUERY = gql(`query ${queryName}($where: ${inputName}) {${queryName} (where: $where) { id ${query} }}`)
        return (
            <Query query={QUERY} variables={{where}}>
                {({loading, error, data, variables, refetch}) => {
                    if (error) throw error
                    const docs = loading || ! data || !Array.isArray(data[queryName]) ? [] : data[queryName]
                    const allowedValues = docs.map(({id}) => id)
                    const transform = getTransform(docs, labeler)
                    let mode = props.mode,
                        value
                    console.log('value,2222',value)
                    let onChange = value => props.onChange({id: value})

                    if (props.field.isArray) {
                        mode = props.mode || "multiple"
                        value = props.value && props.value.map(({id}) => id)
                        console.log('value,33333',value)
                        onChange = values => {
                             props.onChange(values && values.map(id => ({id})));
                        }
                    }else{
                        value = props.value && props.value.id
                        if (isEmpty(value)) value=null
                    }

                    return <SelectField {...props}
                                        mode={mode}
                                        transform={transform}
                                        placeholder={props.loading ? '.... ... .. .' : props.placeholder}
                                        disabled={loading || props.disabled}
                                        onChange={onChange}
                                        value={value}
                                        notFoundContent={loading ? <Spin size="small"/> : null}
                                        allowedValues={allowedValues}
                    />
                }}
            </Query>
        )
    } else {

    }
}

export default connectField(Table, {
    ensureValue: false,
    includeInChain: false,
    initialValue: true
})



