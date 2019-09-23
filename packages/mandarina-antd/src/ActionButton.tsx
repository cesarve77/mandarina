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
import Button from "antd/lib/button";
import {ButtonProps} from "antd/lib/button";


export interface ActionButtonProps extends Omit<ButtonProps, 'onError'>, Omit<MutationProps, 'children' | 'mutation'> {
    actionName: string,
    result: string,
    resultFields?: string[]
    refetchSchemas?: string[],
    data?: any,
    innerRef?: LegacyRef<Button>
    onSuccess?: (data?: any) => void
}

class ActionButton extends React.PureComponent<WithApolloClient<ActionButtonProps>> {
    schemaName: string

    constructor(props: WithApolloClient<ActionButtonProps>) {
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
        const gqlString = `
            mutation ${actionName} {
                ${actionName}
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
                                if (rest.onClick) rest.onClick(e)
                                mutation({variables: {data}}).then(result => onSuccess && onSuccess(result))
                            }}/>
                    );
                }}
            </Mutation>
        )
    }
}

const ActionFormWithApollo = withApollo(ActionButton)

export default React.forwardRef<Button, ActionButtonProps>((props, ref) =>
    <ActionFormWithApollo {...props} innerRef={ref}/>)












