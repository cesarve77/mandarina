import {Prisma} from "prisma-binding";
import {ContextParameters} from "graphql-yoga/dist/types";

import {ActionType} from "mandarina/build/Auth/Auth";
import {Schema} from "mandarina";
import {UniqueSchemaError} from 'mandarina/build/Errors/UniqueSchemaError';
import {SchemaInstanceNotFound} from "mandarina/build/Errors/SchemaInstanceNotFound";
import {capitalize} from 'mandarina/build/Schema/utils';
import {MissingIdTableError} from "mandarina/build/Errors/MissingIDTableError";
import {ErrorFromServerMapper} from "mandarina/src/Schema/Schema";
import Mandarina, {UserType} from "../Mandarina";
import {deepClone} from "mandarina/build/Operations/Mutate";
import {parseValue, print, Source, visit} from 'graphql/language'
import {GraphQLResolveInfo} from "graphql";
import stringifyObject from 'stringify-object'
import {isEmpty} from "lodash";

// import {flatten, unflatten} from "flat";

/**
 *
 * A Table instance is the representation of the one of several of the followings:
 * Physic table in the data base
 * Form
 * List of results
 */
export class Table {
    // An object with all table instances created
    static instances: { [name: string]: Table };
    public schema: Schema;
    public name: string;
    public options: TableSchemaOptions & TableShapeOptions;


    constructor(schema: Schema, tableOptions?: TableShapeOptions) {
        Table.instances = Table.instances || {};
        this.schema = schema;
        this.name = this.schema.name;

        if (!this.schema.keys.includes('id')) {
            throw new MissingIdTableError(this.name);
        }

        if (Table.instances[this.name]) {
            throw new UniqueSchemaError(this.name);
        }

        this.options = {...tableOptions};

        Table.instances[this.name] = this;
    }

    static getInstance(name: string): Table {
        if (!Table.instances[name]) {
            throw new SchemaInstanceNotFound(name);
        }

        return Table.instances[name];
    }

    getFields() {
        return this.schema.getFields();
    }

    /*
     * It apply the fields permissions policy by action and roles, throw an exception if is not a valid request
     *
     * @param action
     * @param role
     * @param model

    validatePermissions(action: ActionType, role: string | string[] | null | undefined, model: string[] | any): void {
        const fields = this.getFields();
        const allowedFields = Object.keys(this.getSchema(action, role));
        const modelFields = (Array.isArray(model) ? model : Object.keys(model)).filter(f => fields.includes(f));
        const intersection = allowedFields.filter(af => modelFields.includes(af));

        if (modelFields.length > intersection.length) {
            const invalidFields = modelFields.filter(mf => !intersection.includes(mf));
            throw new FieldsPermissionsError(action, invalidFields);
        }
    }
 */
    shouldHasManyUpdate() {
        const fields = this.schema.getFields().filter(f => f !== 'createdAt' && f !== 'createdAt')
        return fields.length > 0
    }

    //Insert where option in to the query
    // static dotConcat = (a: string | undefined, b: string) => a ? `${a}.${b}` : b;

    getDefaultActions(type: operationType) {

        // OperationName for query is user or users, for mutation are createUser, updateUser ....
        const operationNames: string[] = Object.values(this.schema.names[type]);
        const resultResolvers: { [resolverName: string]: (_: any, args: any, context: Context, info: any) => void } = {};


        operationNames.forEach((operationName: string) => {
            if (!this.shouldHasManyUpdate()) return

            resultResolvers[operationName] = async (_: any, args: any = {}, context: Context, info: GraphQLResolveInfo) => {
                bm()
                console.log('argsargsargs1',deepClone(args))
                const user = await Mandarina.config.getUser(context)
                const subOperationName: ActionType | string = operationName.substr(0, 6)
                const action: ActionType = <ActionType>(['create', 'update', 'delete'].includes(subOperationName) ? subOperationName : 'read')
                let result: any
                const capitalizedAction = capitalize(action)
                await this.callHook(this.name, 'beforeValidate', _, args, context, info);
                const isSingleMutation = operationName === this.schema.names.mutation.update || operationName === this.schema.names.mutation.create
                let {query, queryString, fields} = this.insertWhereIntoInfo(info, user, isSingleMutation)
                if (type === 'mutation') {
                    // if (errors.length > 0) {
                    //     await this.callHook('validationFailed', action, _, args, context, info);
                    // } else {
                    //     await this.callHook('afterValidate', action, _, args, context, info);
                    // }
                    if (isSingleMutation) {
                        const where = this.options.where && this.options.where(user)
                        if (where) {
                            let finalWhere = args.where ? {AND: [args.where, where]} : where
                            const exists = (await context.prisma.exists[this.name](finalWhere))
                            if (!exists) {
                                return null
                            }


                        }
                    }
                    //VALIDATE IF USER CAN MUTATE THOSE FIELDS
                    this.schema.validateMutation(action, deepClone(args), user && user.roles || []);
                    await this.callHook(this.name, <HookName>`before${capitalizedAction}`, _, args, context, query);
                    console.log('argsargsargs2',args)

                    /*
                    HACK https://github.com/prisma/prisma/issues/4327
                     */
                    // if (`before${capitalizedAction}` === 'beforeUpdate' || `before${capitalizedAction}` === 'beforeCreate') {
                    //     const flat = flatten(args.data)
                    //     const where = args.where
                    //     let run = false
                    //     let withDeleteMany: any = {}
                    //     let withoutDeleteMany: any = {}
                    //     Object.keys(flat).forEach((key) => {
                    //         if (key.match(/\.deleteMany\.0$/)) {
                    //             run = true
                    //             withDeleteMany[key] = flat[key]
                    //         } else {
                    //             withoutDeleteMany[key] = flat[key]
                    //         }
                    //     })
                    //     if (run) {
                    //         await prismamethod({where, data: unflatten(withdeletemany)}, info);
                    //         args.data = unflatten(withoutDeleteMany)
                    //     }
                    // }
                    console.log('queryString', queryString)
                    const data = (await context.prisma.request(queryString, args))
                    if (data.errors){
                        console.log('args',args)
                        console.log('queryString',queryString)
                        console.log('data',data)
                        console.error(data.errors)
                    }
                    result = data.data[info.path.key]
                    context.result = result
                    await this.callHook(this.name, <HookName>`after${capitalizedAction}`, _, args, context, query);
                    this.schema.validateQuery(fields, user && user.roles || []);

                }
                if (type === 'query') {

                    // console.dir(JSON.parse(JSON.stringify(info)),{depth:1})
                    await this.callHook(this.name, 'beforeQuery', _, args, context, query);
                    if (!!info.fieldName.match(/Connection$/)) {
                        this.schema.validateConnection(user && user.roles || []);
                    } else {
                        this.schema.validateQuery(fields, user && user.roles || []);
                    }
                    //Validate if the roles is able to read those fields

                    if (operationName===this.schema.names.query.single){
                        queryString=queryString.replace(operationName,this.schema.names.query.plural)
                        queryString=queryString.replace(new RegExp(`${this.schema.names.input.where.single}!?`),this.schema.names.input.where.plural +'!')
                    }
                    const data = (await context.prisma.request(queryString, args))
                    if (data.errors){
                        console.log('args',args)
                        console.log('queryString',queryString)
                        console.log('data',data)
                        console.error(data.errors)
                    }
                    result = data.data[info.path.key]
                    if (operationName===this.schema.names.query.single){
                        result = data.data[this.schema.names.query.plural]
                        result=result && result.length===1 ? result[0] : null
                    }
                    context.result = result
                    await this.callHook(this.name, 'afterQuery', _, args, context, info);
                }
                bm(`${operationName} ${type}`,result)

                return result;
            }
        });

        return resultResolvers;
    }

    insertWhereIntoInfo = (info: GraphQLResolveInfo, user?: UserType | null, isSingleMutation = false) => {
        const field: string[] = []
        const fields = new Set<string>()
        let required = false
        const query = visit(info.operation, {
            enter: (node, key, parent, path, ancestors) => {
                if (node.kind === 'Field' && node.name.value !== '__typename') {
                    field.push(node.name.value)
                    const internalField = field.slice(1).join('.')
                    let table: Table | undefined
                    if (internalField) {
                        fields.add(internalField)
                        const def = this.schema.getPathDefinition(internalField)
                        if (def.isTable && def.isArray) {
                            table = Table.instances[def.type]
                        }
                    } else {
                        table = this
                    }
                    if (table && table.options.where && (!isSingleMutation && table === this)) {
                        const where = table.options.where(user)
                        if (!where || isEmpty(where)) return
                        const clone = deepClone(node)
                        const originalWhereObj = clone.arguments ? clone.arguments.find((a: any) => a.name.value === 'where') : null
                        let originalWhereString = ''
                        if (originalWhereObj && table === this) {
                            originalWhereString = print(originalWhereObj.value)
                            required = true
                        }
                        const newWhereString = stringifyObject(where, {singleQuotes: false})
                        let finalWhereString = originalWhereString ? `{AND:[${originalWhereString},${newWhereString}]}` : newWhereString
                        if (originalWhereObj) {
                            originalWhereObj.value = parseValue(new Source(finalWhereString))
                        } else {
                            clone.arguments.push({
                                kind: 'Argument',
                                name:
                                    {kind: 'Name', value: 'where'},
                                value: parseValue(new Source(finalWhereString))
                            })
                        }
                        return clone
                    }
                }
                return
            },
            leave(node) {
                if (node.kind === 'Field' && node.name.value !== '__typename') {
                    field.pop()
                }

            }

        });
        let queryString= print(query)
        if (required) queryString=queryString.replace(/\$where: (\w*)Input,/,'$where: $1Input!,')
        return {fields: Array.from(fields), query, queryString}
    }


    /**
     * Go back a mutation object to the original object
     */


    /**
     * Simple wrapper to execute the table hook if exists and sub hook (nested hooks)
     *
     * @param name
     * @param actionType
     * @param _
     * @param args
     * @param context
     * @param info
     */
    async callHook(schemaName: string, name: HookName, _: any, args: any, context: any, info: GraphQLResolveInfo) {
        try {
            let prefix = ''
            if (name.indexOf('before') === 0) prefix = 'before'
            if (name.indexOf('after') === 0) prefix = 'after'
            const hookHandler = this.options.hooks && this.options.hooks[name];
            let data: any = args.data


            if (data && prefix) {
                const fields = Object.keys(data)
                const schema = Schema.getInstance(schemaName)
                for (const field of fields) {
                    const def = schema.getPathDefinition(field)
                    const inline = !!(def.table && def.table.relation && def.table.relation.link === 'INLINE')
                    if (def.isTable) {
                        const operations = Object.keys(data[field])
                        if (!Table.instances[def.type]) {
                            console.warn(`No table for ${def.type} no neasted hooks applied`)
                            continue
                        }
                        const table = Table.getInstance(def.type)
                        for (const operation of operations) {
                            const hookName = `${prefix}${capitalize(operation)}` as HookName
                            const args2 = data[field][operation]
                            if (Array.isArray(args2)) {
                                for (const arg2 of args2) {
                                    if (inline) {
                                        await table.callHook(def.type, hookName, _, {data: arg2}, context, info)
                                    } else {
                                        await table.callHook(def.type, hookName, _, arg2, context, info)
                                    }

                                }
                            } else {
                                if (inline) {
                                    await table.callHook(def.type, hookName, _, {data: args2}, context, info)
                                } else {
                                    await table.callHook(def.type, hookName, _, args2, context, info)
                                }
                            }

                        }

                    }
                }
            }
            if (hookHandler) {
                await hookHandler(_, args, context, info);
            }
        } catch (e) {
            console.error(`Error executing hook: "${name}" in Table: ${schemaName}"`)
            throw e
        }

    }


    // private flatFields(model: any) {
    //     const fieldWrappers = ['connect', 'create', 'udpate', 'delete', 'set'];
    //     const composedFields = Object.keys(model).filter(key => {
    //         const wrapperKey = model[key] && Object.keys(model[key]).pop() || '';
    //         return fieldWrappers.includes(wrapperKey);
    //     });
    //
    //     if (composedFields.length > 0) {
    //         const mappedFields = composedFields.reduce((p, key) => {
    //             const wrapperKey = Object.keys(model[key]).pop() || '';
    //
    //             return {
    //                 ...p,
    //                 [key]: model[key][wrapperKey]
    //             };
    //         }, {});
    //
    //         return {
    //             ...model,
    //             ...mappedFields
    //         };
    //     }
    //
    //     return model;
    // }


}

export interface Context extends ContextParameters {
    prisma: Prisma

    [others: string]: any
}


export interface Hook {
    (_: any, args: any, context: any, info: any): Promise<any> | void | any
}

export type operationType = "mutation" | "query"


export interface TableSchemaOptions {
    virtual?: boolean
    hooks?: {
        beforeValidate?: Hook
        afterValidate?: Hook
        validationFailed?: Hook
        beforeCreate?: Hook
        beforeDelete?: Hook
        beforeUpdate?: Hook
        beforeSave?: Hook
        afterCreate?: Hook
        afterDelete?: Hook
        afterUpdate?: Hook

        // Query operation hooks
        beforeQuery?: Hook
        afterQuery?: Hook
    }
    filters?: Filter[]
}

export type Filter = {
    [field: string]: { roles: string[], operator: string, value: any }
}

export interface TableShapeOptions extends TableSchemaOptions {
    errorFromServerMapper?: ErrorFromServerMapper,
    where?: (user?: UserType | null) => any
}


type HookName =
    'beforeValidate'
    | 'afterValidate'
    | 'validationFailed'
    | 'beforeCreate'
    | 'beforeDelete'
    | 'beforeUpdate'
    | 'afterCreate'
    | 'afterDelete'
    | 'afterUpdate'
    | 'beforeQuery'
    | 'afterQuery'

let time = new Date().getTime()

export function bm(description = '',...args:any) {
    description && console.info(description,...args, new Date().getTime() - time)
    time = new Date().getTime()

}
