import React, {PureComponent, ReactElement} from "react"
import {Schema} from '..'
import gql from "graphql-tag";
import {Mutation, MutationFn, MutationProps, MutationResult, withApollo, WithApolloClient} from "react-apollo";
import {buildQueryFromFields} from "./utils";
import {FindOne} from './Find'
import {Native} from "../Schema/Schema";
import {MutationBaseOptions} from "apollo-client/core/watchQueryOptions";
import {FetchResult} from "react-apollo/Mutation";
import {ApolloClient, OperationVariables} from "apollo-client";
import {DocumentNode} from "graphql";
import {cloneDeep as deepCloneLodash} from 'lodash'
import {DataProxy} from "apollo-cache";
import {generateUUID} from "../utils";

export const deepClone = (obj: any): any => {
    return deepCloneLodash(obj)
}


export type MutateResultProps =
    { refetchSchemas?: string[] }
    & Pick<MutationProps, 'client' | 'ignoreResults' | 'variables' | 'optimisticResponse' | 'refetchQueries' | 'awaitRefetchQueries' | 'update' | 'onCompleted' | 'onError' | 'context' | 'fetchPolicy'>

export interface MutateProps extends MutateResultProps {
    children: MutateChildren
    schema: Schema
    fields: string[]
    where?: any
    loading?: boolean
    doc?: Object


}

type BasicMutateProps = Exclude<MutateProps, 'loading' | 'doc'>

export interface UpdateProps extends BasicMutateProps {
    id: string | any

}

export interface DeleteProps extends BasicMutateProps {
    id: string | any

}


export interface CreateProps extends BasicMutateProps {
}

export interface FormChildrenParams extends MutationResult {
    schema: Schema,
    doc?: Object

}

export interface MutateChildrenParams extends FormChildrenParams {
    mutate: (model: Model) => Promise<void | FetchResult<Model>>

}

export interface MutateChildren {
    (mutateChildrenParams: MutateChildrenParams): ReactElement
}


export interface Model {
    id?: string

    [key: string]: any
}

export interface Wrapper {
    (result: any, type?: Schema | Native): object
}

export interface Initiator {
    (obj: any, schema: Schema): void
}

type MutationType = 'create' | 'update' | 'delete'

export class Mutate extends PureComponent<WithApolloClient<MutateProps & { type: MutationType }>> {

    query: string

    buildQueryFromFields = () => buildQueryFromFields(this.props.fields || this.props.schema.getFields())

    /**
     * walk al properties of the model add new properties with initiator, and wrap values with wrapper
     * @param {object} obj
     * @param {Schema} schema
     * @param {function} wrapper - wrap the value for eg. from {schema: []} return {schema: {create: []}}
     * @param {function} initiator - function with return the object with  initial value of the model (for each level)
     * @return {object} - transformed model
     */
    spider(obj: any, schema: Schema, wrapper: Wrapper, initiator: Initiator): any {
        if (typeof obj !== "object" || obj === undefined || obj === null) return obj
        if (Array.isArray(obj)) {
            return obj.map((obj) => (this.spider(obj, schema, wrapper, initiator)))
        } else {
            const data = initiator(obj, schema)
            Object.keys(obj).forEach((key) => {
                const value = obj[key]
                let definition = schema.getPathDefinition(key)
                if (typeof value === "object" && value !== null && value !== undefined && !(value instanceof Date)) {
                    if (definition.isTable) {
                        const schema = Schema.getInstance(definition.type)
                        data[key] = wrapper(this.spider(value, schema, wrapper, initiator), schema)
                    } else {
                        const native = definition.type
                        data[key] = wrapper(this.spider(value, schema, wrapper, initiator), native)
                    }
                } else {
                    data[key] = (value)
                }
            })
            return data
        }
    }


    getSubSchemaMutations(model: Model, schema: Schema) {
        return getSubSchemaMutations(model, schema, this.props.type)
    }


    getTypesDoc(obj: Model, schema: Schema) {
        const wrapper: Wrapper = (result) => result
        const initiator: Initiator = (obj, schema) => {
            const res: { id?: string, __typename: string } = {
                __typename: schema.name
            }
            if (obj.id) {
                res.id = obj.id
            }
            return res
        }
        return this.spider(obj, schema, wrapper, initiator)
    }

    /**
     * get the model, transform it for prisma inputs and passed to mutationFn, returns the result
     * @param {object} model
     * @param {function} mutationFn - function got it from Mutation component, it receive the an object {variables: {data:model, where},optimisticResponse}
     * @return {Promise<{object}>} result of the mutation
     */
    mutate(model: Model, mutationFn: MutationFn): Promise<void | FetchResult<Model>> {
        const {schema, where, type, optimisticResponse} = this.props
        const cleaned = deepClone(model)
        //schema.clean(cleaned, this.props.fields)// fill null all missing keys
        const data = this.getSubSchemaMutations(cleaned, schema)
        const mutation: MutationBaseOptions = {variables: {}}
        if (type !== 'delete') {
            mutation.variables!.data = data
        }
        if (type === 'update' || type === 'delete') {
            mutation.variables!.where = where
            Object.assign(cleaned, where)
        }
        if (optimisticResponse !== false) {
            if (!optimisticResponse) {
                const docWithTypes = this.getTypesDoc(cleaned, schema)

                const {names} = schema
                mutation.optimisticResponse = {[names.mutation[type]]: docWithTypes}
            } else {
                mutation.optimisticResponse = optimisticResponse
            }
        }
        return mutationFn(mutation)
    }

    // update = (proxy: DataProxy, mutationResult: FetchResult<any>) => {
    //     if (this.props.type === 'create') {
    //         // @ts-ignore
    //         window.proxy = proxy
    //         console.log('mutationResult', mutationResult)
    //         const doc = mutationResult && mutationResult[this.props.schema.names.mutation.create]
    //
    //         // @ts-ignore
    //         const queries = proxy.data && proxy.data.data && proxy.data.data.ROOT_QUERY
    //         console.log('queries', queries)
    //         if (!queries) return
    //         const {names} = this.props.schema
    //
    //         Object.keys(queries).forEach(query => {
    //             const regExp = new RegExp(`^(${this.props.schema.names.query.connection}|${this.props.schema.names.query.plural})\\((.*)\\)`)
    //             // @ts-ignore
    //
    //             const match = query.match(regExp)
    //
    //             if (match) {
    //                 const queryName = match[1]
    //                 const queryFields = queryName === names.query.connection ? `
    //                      pageInfo {
    //                       hasNextPage
    //                       hasPreviousPage
    //                       startCursor
    //                       endCursor
    //                     }
    //                     edges {
    //                       node  {id}
    //                     }` : ` {id}`
    //                 const queryString = `
    //                   query ($where: ${names.input.where.connection}, $after: String, $first: Int, $skip: Int, $orderBy: ${names.orderBy})
    //                     { ${queryName} (where: $where, after: $after, first: $first, skip: $skip, orderBy: $orderBy) {
    //                             ${queryFields}
    //                         }
    //                     }`
    //                 console.log('queryFields', queryFields)
    //                 console.log('queryString', queryString)
    //                 const QUERY = gql(queryString)
    //                 let docs
    //                 const variables = JSON.parse(match[2])
    //
    //                 try {
    //                     const cache = proxy.readQuery({query: QUERY, variables});
    //                     // @ts-ignore
    //                     console.log(cache)
    //                     docs = cache && cache[queryName]
    //                 } catch (e) {
    //                     console.error('error', e)
    //                     docs = []
    //                 }
    //
    //                 console.log('docs', docs)
    //                 const where = variables.where || {}
    //                 const after = variables.after
    //                 const first = variables.first
    //                 const skip = variables.skip
    //                 const orderBy = variables.orderBy
    //                 if (queryName === names.query.connection) {
    //                     docs.edges.push({node: doc})
    //                 } else {
    //                     docs = docs.push(doc)
    //                 }
    //                 console.log('nodes', docs)
    //
    //                 proxy.writeQuery({
    //                     query: QUERY,
    //                     variables,
    //                     data: {[queryName]: docs}
    //                 });
    //
    //             }
    //             console.log('key.match(regExp)',)
    //         })
    //         console.log('proxy', proxy)
    //     }
    // }
    //
    //

    refetchQueries = (mutationResult: FetchResult) => {
        return refetchQueries(mutationResult, this.props.client, this.props.refetchSchemas, this.props.schema)
    }
    invalidateCache = (cache: DataProxy) => {
        if (this.props.type === 'create') {
            // Loop through all the data in our cache
            // And delete any items that start with "this.props.schema.name"
            // This empties the cache of all of our schema and
            // forces a refetch of the data.

            // @ts-ignore
            // Object.keys(cache.data.data).forEach(key => {
            //     const regExp = new RegExp(`^(\\$ROOT_QUERY\\.${this.props.schema.names.query.plural}|\\$ROOT_QUERY\\.${this.props.schema.names.query.connection})`)
            //     if (key.match(regExp)){
            //         console.log(this.name,'deletinf',key)
            //         // @ts-ignore
            //         cache.data.delete(key)
            //     }
            // })
        }
    }

    render() {
        const {
            type, children, schema, fields, loading: findLoading,
            variables,
            update = this.invalidateCache,
            ignoreResults,
            optimisticResponse,
            refetchQueries = this.refetchQueries,
            awaitRefetchQueries,
            onCompleted,
            onError,
            context,
            client,
            doc,
            fetchPolicy,
        } = this.props;

        const {names} = schema
        this.query = buildQueryFromFields(fields)
        let queryString
        if (type === 'update') {
            queryString = `mutation mutationFn($where: ${names.input.where.single}, $data: ${names.input[type]} ) { ${names.mutation[type]}(data: $data, where: $where) ${this.query} }`
        } else if (type === 'delete') {
            queryString = `mutation mutationFn($where: ${names.input.where.single}) { ${names.mutation[type]}(where: $where) {id} }`
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
                client={client}
                fetchPolicy={fetchPolicy}
            >
                {(mutationFn: MutationFn, {
                    loading,
                    data,
                    error,
                    called,
                    client,

                }: MutationResult) => {
                    if (error) {
                        console.error(error)
                    }
                    return children({
                        schema,
                        mutate: (model: Model) => this.mutate(model, mutationFn),
                        loading: findLoading || loading,
                        data,
                        error,
                        called,
                        client,
                        doc,
                    });
                }}
            </Mutation>
        )
    }
}

const MutateWithApollo = withApollo(Mutate);

export const Delete = ({id, schema, optimisticResponse, ...props}: DeleteProps): ReactElement => {
    let where: any = undefined
    if (id) {
        if (typeof id === 'string') {
            where = {id}

        } else {
            where = id
        }
    }
    return (
        <MutateWithApollo type='delete' schema={schema} where={where}
                          optimisticResponse={optimisticResponse}  {...props}/>
    );
}
export const Create = ({schema, optimisticResponse, ...props}: CreateProps): ReactElement => (
    <MutateWithApollo type='create' schema={schema} optimisticResponse={optimisticResponse}  {...props}/>
)


export const Update = ({id, schema, children, fields, optimisticResponse, ...props}: UpdateProps): ReactElement => {
    let where: any = undefined
    if (id) {
        if (typeof id === 'string') {
            where = {id}

        } else {
            where = id
        }
    }
    return (
        <FindOne schema={schema} where={where} fields={fields} {...props}>
            {({data, ...findOneProps}) => {
                return (
                    <MutateWithApollo where={where} type='update' doc={data}
                                     {...findOneProps}  schema={schema}  optimisticResponse={optimisticResponse} >
                        {children}
                    </MutateWithApollo>
                );
            }}
        </FindOne>
    );
}

export const refetchQueries = (mutationResult: FetchResult, client: ApolloClient<any>, refetchSchemas: string[] = [], schema?: Schema) => {
    const refetchQueries: { query: DocumentNode, variables?: OperationVariables }[] = []
    const {single = '', plural = '', connection = ''} = (schema && schema.names.query) || {}
    // @ts-ignore
    client.cache.watches.forEach(({query, variables}) => {
        const queryName = query.definitions[0].selectionSet.selections[0].name.value
        const names: string[] = []
        if (refetchSchemas) {
            refetchSchemas.forEach((schemaName) => {
                const schema = Schema.getInstance(schemaName)
                names.push(schema.names.query.single)
                names.push(schema.names.query.plural)
                names.push(schema.names.query.connection)
            })
        }
        if (queryName === single || queryName === plural || queryName === connection || names.includes(queryName)) {
            refetchQueries.push({query, variables})
        }
    })
    return refetchQueries
}

export const getSubSchemaMutations = (model: Model, schema: Schema, mutationType: MutationType) => {
    const obj: any = {}
    if (typeof model !== "object" || model === undefined || model === null) return model
    Object.keys(model).forEach((key) => {
        const value = model[key]
        let definition = schema.getPathDefinition(key)
        //1 to n relations
        if (definition.isTable) {
            if (definition.isArray) {
                const schema = Schema.getInstance(definition.type)
                if (!Array.isArray(value)) {
                    obj[key] = null
                }
                let result: { create?: any[], update?: any[], set?: any[], connect?: any[] } = {}
                if (value && value.length === 0 && mutationType === 'update') result.set = []
                value && value.forEach((item: any) => {
                    if (item && item.id && Object.keys(item).length === 1) {
                        result['connect'] = result['connect'] || []
                        result['connect'].push(getSubSchemaMutations(item, schema, mutationType))
                        if (mutationType === 'update') {
                            result['set'] = result['set'] || []
                            result['set'].push({id: item.id})
                        }
                    } else if (item && item.id) {
                        if (mutationType === 'update') {
                            const {id, ...clone} = item
                            result['update'] = result['update'] || []
                            result['update'].push({
                                where: {id},
                                data: getSubSchemaMutations(clone, schema, 'update')
                            })
                            result['set'] = result['set'] || []
                            result['set'].push({id: item.id})
                        } else {
                            if (item.id) {
                                result['set'] = result['set'] || []
                                result['set'].push({id: item.id})
                                result['connect'] = result['connect'] || []
                                result['connect'].push(getSubSchemaMutations(item, schema, 'create'))
                            } else {
                                item.id = generateUUID()
                                result['set'] = result['set'] || []
                                result['set'].push({id: item.id})
                                result['create'] = result['create'] || []
                                result['create'].push(getSubSchemaMutations(item, schema, 'create'))
                            }
                        }
                    } else {
                        item.id = generateUUID()
                        result['set'] = result['set'] || []
                        result['set'].push({id: item.id})
                        result['create'] = result['create'] || []
                        //miresult['deleteMany']= [{}]

                        result['create'].push(getSubSchemaMutations(item, schema, 'create'))
                    }

                })
                if ((result && result.create && !result.update) || (result && result.connect && !result.update)) {
                    delete result.set
                }
                obj[key] = result
            } else {
                const schema = Schema.getInstance(definition.type)
                //table
                if (value && value.id && Object.keys(value).length === 1) {
                    obj[key] = {connect: {id: value.id}}
                } else if (mutationType === 'update') {
                    if (value && value.id) {
                        const {id, ...clone} = value
                        obj[key] = {
                            update: getSubSchemaMutations(clone, schema, 'update')
                        }
                    } else {
                        const {id, ...clone} = value
                        obj[key] = {
                            upsert: {
                                create: getSubSchemaMutations(clone, schema, 'create'),
                                update: getSubSchemaMutations(clone, schema, 'update')
                            }
                        }
                    }
                } else {
                    obj[key] = {
                        create: getSubSchemaMutations(value, schema, 'create'),
                    }
                }

            }

        } else {
            if (definition.isArray) {
                obj[key] = {set: value}
            } else {
                return obj[key] = value
            }

        }
    })
    return obj
}
