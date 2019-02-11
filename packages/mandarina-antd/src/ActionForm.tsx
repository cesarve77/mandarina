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
import {filterFields} from "mandarina/build/utils";

export interface ActionFormProps {
    schema: Schema
    actionName: string,
    result: string,
    fields?: string[]
    omitFields?: string[]
    children?: (props: any) => React.ReactNode | React.ReactNode | React.ReactNode[]
    omitFieldsRegEx?: RegExp

    [key: string]: any //replace for uniforms autoform props
}

export class ActionForm extends PureComponent<ActionFormProps> {
    state: { changed: boolean } = {changed: false}

    render() {
        const {
            result,
            actionName,
            schema,
            omitFields,
            children,
            onChange,
            refetchQueries,
            onCompleted,
            fields: optionalFields,
            omitFieldsRegEx,
            onSubmit,
            update,
            ignoreResults,
            optimisticResponse,
            awaitRefetchQueries,
            onError,
            context,
            ...rest
        } = this.props
        const {changed} = this.state
        const resultSchema = Schema.instances[result]
        let fields: string[] | undefined, queryFromFields
        if (resultSchema) fields = filterFields(resultSchema.getFields(), optionalFields, omitFields, omitFieldsRegEx)
        if (fields) {
            queryFromFields = buildQueryFromFields(fields)
        } else {
            queryFromFields = ''
        }
        const gqlString = `
            mutation ${actionName}($data: ${capitalize(schema.name)}Input!) {
                ${actionName}(data: $data)
                    ${queryFromFields}
            }
        `;
        const bridge = new Bridge(schema)
        const MUTATION = gql(gqlString)
        return (
            <Mutation mutation={MUTATION}
                      onCompleted={onCompleted}
                      refetchQueries={refetchQueries}
                      update={update}
                      ignoreResults={ignoreResults}
                      optimisticResponse={optimisticResponse}
                      awaitRefetchQueries={awaitRefetchQueries}
                      onError={onError}
                      context={context}
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
                                  onValidate={(model: Object, error: any, callback: any) => {
                                      try {
                                          bridge.getValidator({})(model)

                                      } catch (e) {
                                          console.error(e)
                                          return callback(e)
                                      }
                                      return callback(null)
                                  }}
                                  onChange={(key: string, value: any) => {
                                      if (error) this.setState({changed: true})
                                      onChange && onChange(key, value)
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
                                <>
                                    <AutoFields autoField={AutoField} omitFields={omitFields}/>
                                    <ErrorsField style={{marginBottom: '15px'}}/>
                                    <SubmitField size='large' loading={loading}/>
                                </>)
                            }
                        </AutoForm>
                    );
                }}
            </Mutation>
        )
    }
}