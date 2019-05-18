import React, {PureComponent} from "react"
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
import {filterFields} from "../utils";
import {cloneDeep as deepCloneLodash} from 'lodash'

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
    fields?: string[]
    omitFields?: string[]
    omitFieldsRegEx?: RegExp
    where?: any
    loading?: boolean
    doc?: Object


}

type BasicMutateProps = Exclude<MutateProps, 'loading' | 'doc'>

export interface UpdateProps extends BasicMutateProps {
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

type MutationType = 'create' | 'update'

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
                let definition = schema.getFieldDefinition(key)
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
            if (schema.keys.includes('id')) {
                res.id = this.props.type === 'update' ? obj.id : ''
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
        console.log('dirty model',model)
        schema.clean(cleaned, this.filteredFields)// fill null all missing keys
        console.log('cleaned model',cleaned, this.filteredFields)
        const data = this.getSubSchemaMutations(cleaned, schema)
        console.log('data',data)
        const mutation: MutationBaseOptions = {variables: {data}}
        if (type === 'update') {
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
    filteredFields: string[]

    render() {
        const {
            type, children, schema, fields: optionalFields, omitFields, omitFieldsRegEx, loading: findLoading,
            variables,
            update,
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
        let fields = filterFields(schema.getFields(), optionalFields, omitFields, omitFieldsRegEx)
        this.filteredFields = fields

        const {names} = schema
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
                client={client}
                fetchPolicy={fetchPolicy}
            >
                {(mutationFn: MutationFn, {
                    loading,
                    data,
                    error,
                    called,
                    client,

                }: MutationResult) => children({
                    schema,
                    mutate: (model: Model) => this.mutate(model, mutationFn),
                    loading: findLoading || loading,
                    data,
                    error,
                    called,
                    client,
                    doc,
                })}
            </Mutation>
        )
    }
}

const MutateWithApollo = withApollo(Mutate);

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
    console.log('model',model)
    const obj: any = {}
    if (typeof model !== "object" || model === undefined || model === null) return model
    Object.keys(model).forEach((key) => {
        const value = model[key]
        let definition = schema.getFieldDefinition(key)
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
                            result['create'] = result['create'] || []
                            result['create'].push(getSubSchemaMutations(item, schema, 'create'))
                        }
                    } else {
                        result['create'] = result['create'] || []
                        result['create'].push(getSubSchemaMutations(item, schema, 'create'))
                    }

                })
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
                        obj[key] = {
                            upsert: {
                                create: getSubSchemaMutations(value, schema, 'create'),
                                update: getSubSchemaMutations(value, schema, 'update')
                            }
                        }
                    }
                } else {
                    obj[key] = {create: getSubSchemaMutations(value, schema, 'create')}
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