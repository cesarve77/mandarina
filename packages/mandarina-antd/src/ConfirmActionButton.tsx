import * as React from 'react'
import {LegacyRef} from 'react'
import {
    FetchResult,
    Mutation,
    MutationFn,
    MutationProps,
    MutationResult,
    withApollo,
    WithApolloClient
} from 'react-apollo'
import gql from "graphql-tag";
import {Schema} from 'mandarina'
import {buildQueryFromFields} from "mandarina/build/Operations/utils";
import {refetchQueries} from "mandarina/build/Operations/Mutate";
import Button, {ButtonProps} from "antd/lib/button";
import {capitalize} from "mandarina/build/Schema/utils";
import {Modal} from "antd";
import {ModalFuncProps} from "antd/lib/modal/Modal";


export interface ConfirmActionButtonProps extends Omit<ButtonProps, 'onError'>, Omit<MutationProps, 'children' | 'mutation'> {
    actionName: string
    result: string
    schema?:Schema
    resultFields?: string[]
    refetchSchemas?: string[]
    data?: any
    innerRef?: LegacyRef<Button>
    onSuccess?: (data?: any) => void
    modalProps: ModalFuncProps
}


class ConfirmActionButton extends React.PureComponent<WithApolloClient<ConfirmActionButtonProps>> {
    schemaName: string

    constructor(props: WithApolloClient<ConfirmActionButtonProps>) {
        super(props)
        this.schemaName = this.props.result.replace(/[\[\]\!]/g, '')
    }

    refetchQueries = (mutationResult: FetchResult) => {
        const schema = Schema.instances[this.schemaName]
        return refetchQueries(mutationResult, this.props.client, this.props.refetchSchemas, schema)
    }

    render() {
        const {
            result,
            data,
            schema,
            actionName,
            onSuccess,
            refetchQueries = this.refetchQueries,
            onCompleted,
            update,
            ignoreResults,
            optimisticResponse,
            awaitRefetchQueries,
            onError,
            context,
            resultFields,
            innerRef,
            modalProps,
            ...rest
        } = this.props
        let queryFromFields = ''
        if (Schema.instances[this.schemaName]) {
            if (!resultFields) throw new Error('ActionForm: if the result is a Schema you need to enter resultFields')
            queryFromFields = buildQueryFromFields(resultFields)
        }
        if (resultFields) {
            queryFromFields = buildQueryFromFields(resultFields, false)
        }
        let dataString='',dataString2=''
        if (schema){
            dataString=`($data: ${capitalize(schema.name)}Input!)`
            dataString2=`(data: $data)`
        }
        const gqlString = `
            mutation ${actionName} ${dataString}{
                ${actionName} ${dataString2}
                    ${queryFromFields}
            }
        `;
        const MUTATION = gql(gqlString)
        return (
            <Mutation mutation={MUTATION}
                      onCompleted={onCompleted}
                // @ts-ignore
                      refetchQueries={refetchQueries}
                      update={update}
                      ignoreResults={ignoreResults}
                      optimisticResponse={optimisticResponse}
                      awaitRefetchQueries={awaitRefetchQueries}
                      onError={onError}
                      context={context}
            >
                {(mutation: MutationFn, {loading, error}: MutationResult) => {
                    return (
                        <Button
                            loading={loading}
                            {...rest}
                            ref={innerRef}
                            onClick={async (e) => {
                                const {onOk,...props}=modalProps
                                Modal.confirm({
                                    ...props,
                                    onOk(arg){
                                        onOk && onOk(arg)
                                        return mutation({variables: {data}}).then(result => onSuccess && onSuccess(result))
                                    }
                                })

                            }}/>
                    );
                }}
            </Mutation>
        )
    }
}

const ConfirmActionFormWithApollo = withApollo(ConfirmActionButton)

export default React.forwardRef<Button, ConfirmActionButtonProps>((props, ref) =>
    <ConfirmActionFormWithApollo {...props} innerRef={ref}/>)












