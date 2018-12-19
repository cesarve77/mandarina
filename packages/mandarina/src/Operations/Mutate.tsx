import React, {PureComponent} from "react"
import {Table} from '../Table/Table'
import gql from "graphql-tag";
import {Mutation, MutationFn, withApollo, WithApolloClient} from "react-apollo";
import {buildQueryFromFields} from "./utils";
import {FindOne} from './Find'
import {Native} from "../Schema/Schema";
import {MutationBaseOptions} from "apollo-client/core/watchQueryOptions";
import {FetchResult} from "react-apollo/Mutation";
import {ApolloError, OperationVariables} from "apollo-client";
import {DocumentNode} from "graphql";
import {DataProxy} from "apollo-cache";
import ApolloClient from "apollo-client/ApolloClient";

type TVariables = any
type TData = any

const deepClone = (obj: any): any => JSON.parse(JSON.stringify(obj))


export interface MutateProps {
    children: MutateChildren
    table: Table
    fields?: string[]
    where?: object
    variables?: { [key: string]: any }
    update?: (cache: DataProxy, mutationResult: FetchResult) => void
    ignoreResults?: boolean
    optimisticResponse?: Object | false
    refetchQueries?: (mutationResult: FetchResult) => Array<{ query: DocumentNode, variables?: TVariables } | string>
    awaitRefetchQueries?: boolean
    onCompleted?: (data: TData) => void
    onError?: (error: ApolloError) => void
    context?: Record<string, any>

    [rest: string]: any
}

export interface UpdateProps extends MutateProps {
    id: string
}


export interface CreateProps extends MutateProps {
}

export interface FormChildrenParams {
    table: Table,
    data: TData
    loading: boolean
    error?: ApolloError
    called?: boolean
    client?: ApolloClient<any>

    [rest: string]: any
}

export interface MutateChildrenParams extends FormChildrenParams{
    mutate: (model: Model) => Promise<void | FetchResult<Model>>

}

export interface MutateChildren {
    (mutateChildrenParams: MutateChildrenParams): JSX.Element
}


export interface Model {
    id?: string

    [key: string]: any
}

export interface Wrapper {
    (result: any, type?: Table | Native): object
}

export interface Initiator {
    (obj: any, table: Table): void
}


class Mutate extends PureComponent<WithApolloClient<MutateProps & { type: 'create' | 'update' }>> {

    query: string

    buildQueryFromFields = () => buildQueryFromFields(this.props.table.getFields())

    /**
     * walk al properties of the model add new properties with initiator, and wrap values with wrapper
     * @param {object} obj
     * @param {Table} table
     * @param {function} wrapper - wrap the value for eg. from {table: []} return {table: {create: []}}
     * @param {function} initiator - function with return the object with  initial value of the model (for each level)
     * @return {object} - transformed model
     */
    spider(obj: any, table: Table, wrapper: Wrapper, initiator: Initiator): any {
        if (typeof obj !== "object" || obj === undefined || obj === null) return obj
        if (Array.isArray(obj)) {
            return obj.map((obj) => (this.spider(obj, table, wrapper, initiator)))
        } else {
            const data = initiator(obj, table)
            Object.keys(obj).forEach((key) => {
                const value = obj[key]
                let definition = table.schema.getFieldDefinition(key)
                if (typeof value === "object" && value !== null && value !== undefined && !(value instanceof Date)) {
                    if (Array.isArray(definition.type)) {
                        if (typeof definition.type[0] === 'string') {
                            const table = Table.getInstance(definition.type[0] as string)
                            data[key] = wrapper(this.spider(value, table, wrapper, initiator), table)
                        } else {
                            const native = definition.type[0] as Native
                            data[key] = wrapper(this.spider(value, table, wrapper, initiator), native)
                        }
                    } else {
                        if (typeof definition.type === 'string') {
                            const table = Table.getInstance(definition.type as string)
                            data[key] = wrapper(this.spider(value, table, wrapper, initiator), table)
                        } else {
                            data[key] = wrapper(this.spider(value, table, wrapper, initiator), definition.type)
                        }
                    }
                } else {
                    data[key] = (value)
                }
            })
            return data
        }
    }

    getSubTableMutations(model: Model, table: Table) {
        const clone = deepClone(model)

        delete clone.id
        const wrapper: Wrapper = (result, type): object => {
            if (type instanceof Table) {
                //todo check next statement id is always there?
                if (Array.isArray(result) && result[0] && result[0].id !== undefined) {
                    const clone = [...result]
                    for (const i in clone) {
                        clone[i] && delete clone[i].id
                    }
                    if (this.props.type === 'create') return {create: clone}
                    if (this.props.type === 'update') return {connect: clone}
                } else {
                    let clone = result
                    if (clone.id !== undefined) {
                        clone = {...clone}
                        delete clone.id
                    }
                    if (this.props.type === 'create') return {create: clone}
                    if (this.props.type === 'update') return {create: clone}
                }

            } else {
                return {set: result}

            }

            return result
        }
        const initiator = () => ({})
        return this.spider(clone, table, wrapper, initiator)
    }


    getTypesDoc(obj: Model, table: Table) {
        const wrapper: Wrapper = (result) => result
        const initiator: Initiator = (obj, table) => ({
            id: this.props.type === 'update' ? obj.id : '',
            __typename: table.name
        })
        return this.spider(obj, table, wrapper, initiator)
    }

    /**
     * get the model, transform it for prisma inputs and passed to mutationFn, returns the result
     * @param {object} model
     * @param {function} mutationFn - function got it from Mutation component, it receive the an object {variables: {data:model, where},optimisticResponse}
     * @return {Promise<{object}>} result of the mutation
     */
    mutate(model: Model, mutationFn: MutationFn): Promise<void | FetchResult<Model>> {
        const {table, where, type, optimisticResponse} = this.props
        const cleaned = deepClone(model)
        table.schema.clean(cleaned)// fill null all missing keys

        const {names} = table
        const data = this.getSubTableMutations(cleaned, table)
        const mutation: MutationBaseOptions = {variables: {data}}
        if (type === 'update') {
            mutation.variables!.where = where
        }
        if (optimisticResponse !== false) {
            if (!optimisticResponse) {
                const docWithTypes = this.getTypesDoc(cleaned, table)

                mutation.optimisticResponse = {[names.mutation[type]]: docWithTypes}
            } else {
                mutation.optimisticResponse = optimisticResponse
            }
        }
        return mutationFn(mutation)
    }

    refetchQueries = (mutationResult: FetchResult) => {
        const refetchQueries: { query: DocumentNode, variables?: OperationVariables }[] = []
        const {single, plural, connection} = this.props.table.names.query
        // @ts-ignore
        this.props.client.cache.watches.forEach(({query, variables}) => {
            const queryName = query.definitions[0].selectionSet.selections[0].name.value
            if (queryName === single || queryName === plural || queryName === connection) {
                refetchQueries.push({query, variables})
            }
        })
        return refetchQueries

        /*if (this.props.type === 'update') return //for updates the cache is automatic updated by apollo

        const {table: {names}} = this.props;
        const doc = data && data[names.mutation.create]
        if (!Array.isArray(FindBase.queries)) return //no quiries to update
        FindBase.queries.forEach((cachedQuery) => {
            const cachedQueryName = Object.keys(cachedQuery)[0]
            const where = cachedQuery[cachedQueryName]
            const docIsInQuery = evalWhere(doc, where)
            console.log('docIsInQuery',docIsInQuery)
            if (cachedQueryName === names.query.plural && docIsInQuery) {
                const QUERY = gql(`query ($where: ${names.input.where.plural} ) { ${names.query.plural}  (where: $where) ${this.query} }`)
                let docs
                try {
                    const cache = proxy.readQuery({query: QUERY, variables: {where}});
                    docs = cache && cache[names.query.plural]
                } catch (e) {
                    console.error('error')
                    docs = []
                }
                proxy.writeQuery({
                    query: QUERY,
                    variables: {where},
                    data: {[names.query.plural]: docs.concat([doc])}
                });

            }
        })*/
    }


    render() {
        const {
            type, children, table, fields, loading: findLoading,
            variables,
            update,
            ignoreResults,
            optimisticResponse,
            refetchQueries = this.refetchQueries,
            awaitRefetchQueries,
            onCompleted,
            onError,
            context,
            ...props
        } = this.props;
        const {names} = table
        this.query = fields ? buildQueryFromFields(fields) : this.buildQueryFromFields()
        let queryString
        if (type === 'update') {
            queryString = `mutation mutationFn($where: ${names.input.where.single}, $data: ${names.input[type]} ) { ${names.mutation[type]}(data: $data, where: $where) ${this.query} }`
        } else {
            queryString = `mutation mutationFn($data: ${names.input[type]} ) { ${names.mutation[type]}(data: $data) ${this.query} }`
        }

        const MUTATION = gql(queryString)
        return (
            <Mutation
                mutation={MUTATION}
                refetchQueries={refetchQueries}
                variables={variables}
                update={update}
                ignoreResults={ignoreResults}
                optimisticResponse={optimisticResponse}
                awaitRefetchQueries={awaitRefetchQueries}
                onCompleted={onCompleted}
                onError={onError}
                context={context}
            >
                {(mutationFn: MutationFn, {
                    loading,
                    data,
                    error,
                    called,
                    client,

                }) => children({
                    table,
                    mutate: (model: Model) => this.mutate(model, mutationFn),
                    loading: findLoading || loading,
                    data,
                    error,
                    called,
                    client,
                    ...props
                })}
            </Mutation>
        )
    }
}

const MutateWithApollo = withApollo(Mutate);

export const Create = ({table, optimisticResponse, ...props}: CreateProps): JSX.Element => (
    <MutateWithApollo type='create' table={table} optimisticResponse={optimisticResponse} {...props}/>
)


export const Update = ({id, table, children, fields, optimisticResponse, ...props}: UpdateProps): JSX.Element => (
    <FindOne table={table} where={{id}} fields={fields} {...props}>
        {({data, ...findOneProps}) => (
            <MutateWithApollo where={{id}} type='update' table={table} doc={data}
                              optimisticResponse={optimisticResponse} {...findOneProps} >
                {children}
            </MutateWithApollo>
        )}
    </FindOne>
)