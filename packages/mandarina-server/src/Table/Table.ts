import {Prisma} from "prisma-binding";
import {ContextParameters} from "graphql-yoga/dist/types";

import {ActionType} from "mandarina/build/Auth/Auth";
import {Schema} from "mandarina";
import {UniqueSchemaError} from 'mandarina/build/Errors/UniqueSchemaError';
import {SchemaInstanceNotFound} from "mandarina/build/Errors/SchemaInstanceNotFound";
import {capitalize} from 'mandarina/build/Schema/utils';
import {MissingIdTableError} from "mandarina/build/Errors/MissingIDTableError";
import {ErrorFromServerMapper} from "mandarina/src/Schema/Schema";
import Mandarina from "../Mandarina";
import {deepClone} from "mandarina/build/Operations/Mutate";
import {flatten} from "flat";
import graphqlFields = require("graphql-fields");

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

    getDefaultActions(type: operationType) {

        const result = {};
        // OperationName for query is user or users, for mutation are createUser, updateUser ....
        const operationNames: string[] = Object.values(this.schema.names[type]);
        operationNames.forEach((operationName: string) => {
            if (!this.shouldHasManyUpdate()) return
            result[operationName] = async (_: any, args: any = {}, context: Context, info: any) => {
                const user = await Mandarina.config.getUser(context)
                // console.log('*****************************************************')
                // console.log('operationName', operationName)
                // console.log('args')
                // console.dir(args, {depth: null})
                let time = new Date().getTime()
                const bm = (description?: string) => {
                    if (description) {
                        console.log(description, new Date().getTime() - time)
                    }
                    time = new Date().getTime()
                }
                bm()
                //const user = await Mandarina.config.getUser(context);
                const subOperationName: ActionType | string = operationName.substr(0, 6)
                const action: ActionType = <ActionType>(['create', 'update', 'delete'].includes(subOperationName) ? subOperationName : 'read')
                const prismaMethod = context.prisma[type][operationName];
                let result: any
                const capitalizedAction = capitalize(action)
                // TODO: Review the hooks architecture for adding a way to execute hooks of nested operations
                await this.callHook(this.name, 'beforeValidate', _, args, context, info);
                if (type === 'mutation') {
                    // if (errors.length > 0) {
                    //     await this.callHook('validationFailed', action, _, args, context, info);
                    // } else {
                    //     await this.callHook('afterValidate', action, _, args, context, info);
                    // }
                    this.schema.validateMutation(action, deepClone(args), user && user.roles);
                    await this.callHook(this.name, <HookName>`before${capitalizedAction}`, _, args, context, info);

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
                    //         await prismaMethod({where, data: unflatten(withDeleteMany)}, info);
                    //         args.data = unflatten(withoutDeleteMany)
                    //     }
                    // }
                    result = await prismaMethod(args, info);
                    //
                    context.result = result
                    await this.callHook(this.name, <HookName>`after${capitalizedAction}`, _, args, context, info);
                    //this.validatePermissions('read', roles, fieldsList(info));

                }
                if (type === 'query') {

                    await this.callHook(this.name, 'beforeQuery', _, args, context, info);

                    console.log('subOperationName', subOperationName)
                    const obj = graphqlFields(info)
                    let flatFields: string[]
                    //todo do somethig better validating what kind of query im running connection or query
                    if (obj.edges && obj.edges.node) {
                        flatFields = Object.keys(flatten(obj.edges.node))
                    } else {
                        flatFields = Object.keys(flatten(obj))
                    }
                    flatFields = flatFields.filter(f => !f.match(/\.?__typename$/))
                    if (!obj.aggregate || !obj.aggregate.count) {
                        this.schema.validateQuery(flatFields, user && user.roles || []);
                    }
                    result = await prismaMethod(args, info);
                    // console.log(graphqlFields(info))
                    context.result = result
                    await this.callHook(this.name, 'afterQuery', _, args, context, info);
                }
                // bm('done in ')
                // console.log('result')
                // console.dir(result)
                //
                // console.log('*****************************************************')
                return result;
            }
        });

        return result;
    }

    register() {
        // TODO: Do we need to implement this method?
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
    async callHook(schemaName: string, name: HookName, _: any, args: any, context: any, info: any) {
        console.log('--------------------')
        console.log(schemaName, name, args)
        console.log('--------------------')
        try {
            const hookHandler = this.options.hooks && this.options.hooks[name];
            if (hookHandler) {
                let data: any = args.data
                const fields = Object.keys(data)
                const schema = Schema.getInstance(schemaName)
                for (const field of fields) {
                    const def = schema.getPathDefinition(field)
                    const inline = !!(def.table && def.table.relation && def.table.relation.link === 'INLINE')
                    if (def.isTable) {
                        const operations = Object.keys(data[field])
                        for (const operation of operations) {
                            const hookName = `before${capitalize(operation)}` as HookName
                            const args2 = data[field][operation]
                            if (!Table.instances[def.type]) continue
                            const table = Table.getInstance(def.type)
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
    errorFromServerMapper?: ErrorFromServerMapper
}


type HookName =
    'beforeValidate'
    | 'afterValidate'
    | 'validationFailed'
    | 'beforeCreate'
    | 'beforeDelete'
    | 'beforeUpdate'
    | 'beforeSave'
    | 'afterCreate'
    | 'afterDelete'
    | 'afterUpdate'
    | 'beforeQuery'
    | 'afterQuery'



