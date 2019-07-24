import React, {PureComponent} from 'react'
import {FetchResult, Mutation, MutationFn, MutationResult, withApollo, WithApolloClient} from 'react-apollo'
import gql from "graphql-tag";
import {Schema} from 'mandarina'
import {AutoField, AutoFields, ErrorsField} from './index'

import AutoForm from 'uniforms-antd/AutoForm'
import {Bridge} from "./Bridge";
import {capitalize} from "mandarina/build/Schema/utils";
import {buildQueryFromFields} from "mandarina/build/Operations/utils";
import SubmitField from "uniforms-antd/SubmitField";
import {AutoFormProps} from "./Forms";
import {refetchQueries} from "mandarina/build/Operations/Mutate";
import {Overwrite} from "mandarina/build/Schema/Schema";


export interface ActionFormProps extends AutoFormProps {
    schema: Schema
    actionName: string,
    result: string,
    fields: string[]
    resultFields?: string[]
    children?: React.ReactNode | ((props: any) => React.ReactNode | React.ReactNode[])
    refetchSchemas?: string[]
    overwrite?: Overwrite

    [key: string]: any //replace for uniforms autoform props
}

class ActionForm extends PureComponent<WithApolloClient<ActionFormProps>> {
    state: { changed: boolean } = {changed: false}
    refetchQueries = (mutationResult: FetchResult) => {
        return refetchQueries(mutationResult, this.props.schema, this.props.client, this.props.refetchSchemas)
    }

    render() {
        const {
            result,
            actionName,
            schema,
            children,
            onChange,
            refetchQueries = this.refetchQueries,
            onCompleted,
            fields,
            onSubmit,
            update,
            ignoreResults,
            optimisticResponse,
            awaitRefetchQueries,
            onSubmitSuccess,
            onSubmitFailure,
            onError,
            context,
            overwrite,
            resultFields,
            innerRef,
            ...rest
        } = this.props
        const {changed} = this.state
        let queryFromFields = ''
        const schemaName = result.replace(/[\[\]\!]/g, '')
        if (Schema.instances[schemaName]){
            if (!resultFields) throw new Error('ActionForm: if the result is a Schema you need to enter resultFields')
            queryFromFields = buildQueryFromFields(resultFields)
        }
        const gqlString = `
            mutation ${actionName}($data: ${capitalize(schema.name)}Input!) {
                ${actionName}(data: $data)
                    ${queryFromFields}
            }
        `;
        const bridge = new Bridge(schema, fields, overwrite)
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
                {(mutation: MutationFn, {loading, error, ...restMutation}: MutationResult) => {
                    return (
                        <AutoForm disabled={loading}
                                  onSubmit={(data: object) => {
                                      onSubmit && onSubmit(data)
                                      this.setState({changed: false})
                                      return mutation({variables: {data}});
                                  }}
                                  fields={fields}
                                  onSubmitSuccess={onSubmitSuccess}
                                  onSubmitFailure={onSubmitFailure}
                                  schema={bridge}
                                  onValidate={(model: Object, error: any, callback: any) => {
                                      try {
                                          bridge.getValidator()(model)

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
                                  ref={innerRef}
                                  {...rest}>

                            {children && Array.isArray(children) && children}
                            {children && !Array.isArray(children) && (typeof children !== "function") && children}

                            {children && !Array.isArray(children) && (typeof children === "function") && children({loading})}
                            {!children && (
                                <>
                                    <AutoFields autoField={AutoField} fields={fields}/>
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

const ActionFormWithApollo = withApollo(ActionForm)

export default React.forwardRef<HTMLFormElement, ActionFormProps>((props, ref) =>
    <ActionFormWithApollo {...props} innerRef={ref}/>)












