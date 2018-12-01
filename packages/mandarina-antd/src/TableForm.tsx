import React, {PureComponent, ReactChild, ReactElement} from 'react'
import {Mutation} from 'react-apollo'
import gql from "graphql-tag";
import {Table} from 'mandarina'
import {AutoField,ErrorsField,AutoFields} from './index'

import AutoForm from 'uniforms-antd/AutoForm'
import {Bridge} from "./Bridge";
import {capitalize} from "mandarina/build/Table/utils";
import {buildQueryFromFields} from "mandarina/build/Operations/utils";
import SubmitField from "uniforms-antd/SubmitField";
import {ChildFunc} from "./Forms";

export interface TableFormProps {
    table: Table
    operation?: string,
    fields?: string[]
    omitFields?: string[]
    children?:  (props:any) => React.ReactNode | React.ReactNode | React.ReactNode[]
    [key: string]: any //replace for uniforms autoform props
}

export class TableForm extends PureComponent<TableFormProps> {
    state: { changed: boolean } = {changed: false}

    render() {
        const {table, omitFields,children, operation: operationProp, fields: fieldsProp,onSubmit, ...rest} = this.props
        const {changed} = this.state
        const resolvers = table.options.resolvers || {}
        let operation=operationProp
        if (!operation){
            if (!table.options.resolvers) throw new Error (`Table ${table.name} does not have resolver, one is required to be used in TableForm`)
            const resolvers=Object.keys(table.options.resolvers)
            if (resolvers.length===0) throw new Error (`Table ${table.name} does not have resolver, one is required to be used in TableForm`)
            if (resolvers.length>1) throw new Error (`Table ${table.name} have more than one resolver, you need to specify operation prop in TableForm`)
            operation=resolvers[0]
        }
        const result = resolvers[operation].result.replace(/\!$/, '')
        const resultTable = Table.instances[result]
        let fields, queryFromFields
        if (resultTable) fields = fieldsProp || resultTable.getFields()
        if (fields) {
            queryFromFields = buildQueryFromFields(fields)
        } else {
            queryFromFields = ''
        }
        const gqlString = `
            mutation ${operation}($data: ${capitalize(operation)}Input!) {
                ${operation}(data: $data)
                    ${queryFromFields}
            }
        `;
        const schema = new Bridge(table)
        const MUTATION = gql(gqlString)

        return (
            // @ts-ignore
            <Mutation mutation={MUTATION} fetchPolicy='network-only' onCompleted={(data)=>console.log('onCompleted',data)}>
                {(mutation, {loading, error, ...restMutation}) => {
                    return (
                        <AutoForm disabled={loading}
                                  onSubmit={(data: object) => {
                                      onSubmit && onSubmit(data)
                                      this.setState({changed: false})
                                      return mutation({variables: {data}});
                                  }}
                                  schema={schema}
                                  onChange={() => {
                                      if (error) this.setState({changed: true})
                                  }}
                                  error={changed ? undefined : error}

                                  {...rest}>
                            {children && Array.isArray(children) && children.map((child: ReactElement<ReactChild> | ChildFunc ) => {
                                if (typeof  child === "function") {
                                    return child({loading})
                                }
                                return React.cloneElement(child)
                            })}
                            {children && !Array.isArray(children) && (typeof  children === "function") && children({loading})}
                            {children && !Array.isArray(children) && (typeof  children !== "function") && children}
                            {!children && (
                                <div>
                                    <AutoFields autoField={AutoField} omitFields={omitFields}/>
                                    <ErrorsField style={{marginBottom: '15px'}}/>
                                    <SubmitField size='large' loading={loading}/>
                                </div>)
                            }
                        </AutoForm>
                    );
                }}
            </Mutation>
        )
    }
}