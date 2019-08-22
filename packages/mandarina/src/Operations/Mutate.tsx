import React, {PureComponent} from "react"
import {Schema} from '..'
import gql from "graphql-tag";
import {Mutation, MutationFn, MutationProps, MutationResult, withApollo, WithApolloClient} from "react-apollo";
import {buildQueryFromFields, generateUUID} from "./utils";
import {FindOne} from './Find'
import {Native} from "../Schema/Schema";
import {MutationBaseOptions} from "apollo-client/core/watchQueryOptions";
import {FetchResult} from "react-apollo/Mutation";
import {ApolloClient, OperationVariables} from "apollo-client";
import {DocumentNode} from "graphql";
import {cloneDeep as deepCloneLodash} from 'lodash'
import {DataProxy} from "apollo-cache";

export const deepClone = (obj: any): any => {
    return deepCloneLodash(obj)
    // const result=JSON.parse(JSON.stringify(obj))
    // if (typeof obj.type==='function'){
    //     result.type=obj.type
    // }
    // return result
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
    (mutateChildrenParams: MutateChildrenParams): React.ReactNode
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
        schema.clean(cleaned, this.props.fields)// fill null all missing keys
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

    refetchQueries = (mutationResult: FetchResult) => {
        return refetchQueries(mutationResult, this.props.schema, this.props.client, this.props.refetchSchemas)

        /*if (this.props.type === 'update') return //for updates the cache is automatic updated by apollo

        const {schema: {names}} = this.props;
        const doc = data && data[names.mutation.create]
        if (!Array.isArray(FindBase.queries)) return //no quiries to update
        FindBase.queries.forEach((cachedQuery) => {
            const cachedQueryName = Object.keys(cachedQuery)[0]
            const where = cachedQuery[cachedQueryName]
            const docIsInQuery = evalWhere(doc, where)

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
    invalidateCache = (cache: DataProxy) => {
        // Loop through all the data in our cache
        // And delete any items that start with "ListItem"
        // This empties the cache of all of our list items and
        // forces a refetch of the data.
        // @ts-ignore
        console.log('cache.data', cache.data)
        // @ts-ignore

        Object.keys(cache.data.data).forEach(key =>
            // @ts-ignore
            key.match(/^ListItem/) && cache.data.delete(key)
        )
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
        console.log('queryString', queryString)

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

export const Delete = ({id, schema, optimisticResponse, ...props}: DeleteProps): JSX.Element => {
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
export const Create = ({schema, optimisticResponse, ...props}: CreateProps): JSX.Element => (
    <MutateWithApollo type='create' schema={schema} optimisticResponse={optimisticResponse}  {...props}/>
)


export const Update = ({id, schema, children, fields, optimisticResponse, ...props}: UpdateProps): JSX.Element => {
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
                    <MutateWithApollo where={where} type='update' schema={schema} doc={data}
                                      optimisticResponse={optimisticResponse} {...findOneProps} >
                        {children}
                    </MutateWithApollo>
                );
            }}
        </FindOne>
    );
}

export const refetchQueries = (mutationResult: FetchResult, schema: Schema, client: ApolloClient<any>, refetchSchemas: string[] = [],) => {
    const refetchQueries: { query: DocumentNode, variables?: OperationVariables }[] = []
    const {single, plural, connection} = schema.names.query
    // @ts-ignore
    window.client = client
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
    console.log('model', model)
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
                let result: { create?: any[], update?: any[], set?: any[] } = {}
                if (value.length === 0 && mutationType === 'update') result.set = []
                value.forEach((item: any) => {
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
                            item.id = generateUUID()
                            result['set'] = result['set'] || []
                            result['set'].push({id: item.id})
                            result['create'] = result['create'] || []
                            result['create'].push(getSubSchemaMutations(item, schema, 'create'))
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
                if (result && result.create && !result.update ) {
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