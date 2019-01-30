import React, {PureComponent, ReactChild, ReactElement} from 'react'
import {Mutation} from 'react-apollo'
import gql from "graphql-tag";
import {Schema} from 'mandarina'
import {AutoField, AutoFields, ErrorsField} from './index'

import AutoForm from 'uniforms-antd/AutoForm'
import {Bridge} from "./Bridge";
import {capitalize} from "mandarina/build/Schema/utils";
import {buildQueryFromFields} from "mandarina/build/Operations/utils";
import SubmitField from "uniforms-antd/SubmitField";
import {ChildFunc} from "./Forms";

export interface ActionFormProps {
    schema: Schema
    actionName: string,
    result: string,
    fields?: string[]
    omitFields?: string[]
    children?: (props: any) => React.ReactNode | React.ReactNode | React.ReactNode[]

    [key: string]: any //replace for uniforms autoform props
}

export class ActionForm extends PureComponent<ActionFormProps> {
    state: { changed: boolean } = {changed: false}
    render() {
        const {result,actionName, schema, omitFields, children, fields: fieldsProp, onSubmit, ...rest} = this.props
        const {changed} = this.state
        const resultSchema = Schema.instances[result]
        let fields, queryFromFields
        if (resultSchema) fields = fieldsProp || resultSchema.getFields()
        if (fields) {
            queryFromFields = buildQueryFromFields(fields)
        } else {
            queryFromFields = ''
        }
        const gqlString = `
            mutation ${actionName}($data: ${capitalize(actionName)}Input!) {
                ${actionName}(data: $data)
                    ${queryFromFields}
            }
        `;
        const bridge = new Bridge(schema)
        const MUTATION = gql(gqlString)
        return (
            // @ts-ignore
            <Mutation mutation={MUTATION}
                      //onCompleted={(data) => console.log('ActionForm onCompleted', data)}
            >
                {(mutation, {loading, error, ...restMutation}) => {
                    return (
                        <AutoForm disabled={loading}
                                  onSubmit={(data: object) => {
                                      onSubmit && onSubmit(data)
                                      this.setState({changed: false})
                                      return mutation({variables: {data}});
                                  }}
                                  schema={bridge}
                                  onChange={() => {
                                      if (error) this.setState({changed: true})
                                  }}
                                  error={changed ? undefined : error}

                                  {...rest}>
                            {children && Array.isArray(children) && children.map((child: ReactElement<ReactChild> | ChildFunc) => {
                                if (typeof child === "function") {
                                    return child({loading})
                                }
                                return React.cloneElement(child)
                            })}
                            {children && !Array.isArray(children) && (typeof children === "function") && children({loading})}
                            {children && !Array.isArray(children) && (typeof children !== "function") && children}
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