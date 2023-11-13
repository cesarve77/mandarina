import { PureComponent, ReactElement } from "react";
import { Schema } from '..';
import { MutationFn, MutationProps, MutationResult, WithApolloClient } from "react-apollo";
import { Native } from "../Schema/Schema";
import { FetchResult } from "react-apollo/Mutation";
import { ApolloClient, OperationVariables } from "apollo-client";
import { DocumentNode } from "graphql";
export declare const deepClone: (obj: any) => any;
export type MutateResultProps = {
    refetchSchemas?: string[];
} & Pick<MutationProps, 'client' | 'ignoreResults' | 'variables' | 'optimisticResponse' | 'refetchQueries' | 'awaitRefetchQueries' | 'update' | 'onCompleted' | 'onError' | 'context' | 'fetchPolicy'>;
export interface MutateProps extends MutateResultProps {
    children: MutateChildren;
    schema: Schema;
    fields: string[];
    where?: any;
    loading?: boolean;
    doc?: Object;
}
type BasicMutateProps = Exclude<MutateProps, 'loading' | 'doc'>;
export interface UpdateProps extends BasicMutateProps {
    id: string | any;
}
export interface DeleteProps extends BasicMutateProps {
    id: string | any;
}
export interface CreateProps extends BasicMutateProps {
}
export interface FormChildrenParams extends MutationResult {
    schema: Schema;
    doc?: Object;
}
export interface MutateChildrenParams extends FormChildrenParams {
    mutate: (model: Model) => Promise<void | FetchResult<Model>>;
}
export interface MutateChildren {
    (mutateChildrenParams: MutateChildrenParams): ReactElement;
}
export interface Model {
    id?: string;
    [key: string]: any;
}
export interface Wrapper {
    (result: any, type?: Schema | Native): object;
}
export interface Initiator {
    (obj: any, schema: Schema): void;
}
type MutationType = 'create' | 'update' | 'delete';
export declare class Mutate extends PureComponent<WithApolloClient<MutateProps & {
    type: MutationType;
}>> {
    query: string;
    buildQueryFromFields: () => string;
    /**
     * walk al properties of the model add new properties with initiator, and wrap values with wrapper
     * @param {object} obj
     * @param {Schema} schema
     * @param {function} wrapper - wrap the value for eg. from {schema: []} return {schema: {create: []}}
     * @param {function} initiator - function with return the object with  initial value of the model (for each level)
     * @return {object} - transformed model
     */
    spider(obj: any, schema: Schema, wrapper: Wrapper, initiator: Initiator): any;
    getSubSchemaMutations(model: Model, schema: Schema): any;
    getTypesDoc(obj: Model, schema: Schema): any;
    /**
     * get the model, transform it for prisma inputs and passed to mutationFn, returns the result
     * @param {object} model
     * @param {function} mutationFn - function got it from Mutation component, it receive the an object {variables: {data:model, where},optimisticResponse}
     * @return {Promise<{object}>} result of the mutation
     */
    mutate(model: Model, mutationFn: MutationFn): Promise<void | FetchResult<Model>>;
    refetchQueries: (mutationResult: FetchResult) => {
        query: DocumentNode;
        variables?: OperationVariables | undefined;
    }[];
    render(): JSX.Element;
}
export declare const Delete: ({ id, schema, optimisticResponse, ...props }: DeleteProps) => ReactElement;
export declare const Create: ({ schema, optimisticResponse, ...props }: CreateProps) => ReactElement;
export declare const Update: ({ id, schema, children, fields, optimisticResponse, ...props }: UpdateProps) => ReactElement;
export declare const refetchQueries: (mutationResult: FetchResult, client: ApolloClient<any>, refetchSchemas?: string[], schema?: Schema) => {
    query: DocumentNode;
    variables?: OperationVariables | undefined;
}[];
export declare const getSubSchemaMutations: (model: Model, schema: Schema, mutationType: MutationType) => any;
export {};
