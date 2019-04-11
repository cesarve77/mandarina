import {Prisma} from "prisma-binding";
import {ContextParameters} from "graphql-yoga/dist/types";

import {ActionType} from "mandarina/build/Auth/Auth";
import {SchemaOptions} from "mandarina/build/Schema/Schema";
import {Schema} from "mandarina";
import {UniqueTableError} from 'mandarina/build/Errors/UniqueTableError';
import {TableInstanceNotFound} from "mandarina/build/Errors/TableInstanceNotFound";
import {capitalize} from 'mandarina/build/Schema/utils';
import {MissingIdTableError} from "mandarina/build/Errors/MissingIDTableError";


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


    /**
     *
     * @param schema
     * @param tableOptions
     */
    constructor(schema: Schema, tableOptions: TableShapeOptions) {
        Table.instances = Table.instances || {};
        this.schema = schema;
        this.name = this.schema.name;

        if (!this.schema.keys.includes('id')) {
            throw new MissingIdTableError(this.name);
        }

        if (Table.instances[this.name]) {
            throw new UniqueTableError(this.name);
        }

        this.options = {...schema.options, ...tableOptions};

        Table.instances[this.name] = this;
    }

    static getInstance(name: string): Table {
        if (!Table.instances[name]) {
            throw new TableInstanceNotFound(name);
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
    getDefaultActions(type: operationType) {

        const result = {};
        // OperationName for query is user or users, for mutation are createUser, updateUser ....
        const operationNames: string[] = Object.values(this.schema.names[type]);
        operationNames.forEach((operationName: string) => {

            result[operationName] = async (_: any, args: any = {}, context: Context, info: any) => {
                console.log('*****************************************************')
                console.log('operationName', operationName)
                console.log('args', args)
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
                //const roles = use zr && user.roles

                let result: any
                console.log('type', type)
                console.log('action', action)
                console.log('before', `before${capitalize(action)}`)
                // TODO: Review the hooks architecture for adding a way to execute hooks of nested operations
                if (type === 'mutation') {

                    await this.callHook('beforeValidate', _, args, context, info);

                    //TODO: Flatting nested fields operation (context, update, create)
                    // console.log('123123123',this.flatFields(args.data))
                    // const errors = this.schema.validate(this.flatFields(args.data));

                    // if (errors.length > 0) {
                    //     await this.callHook('validationFailed', action, _, args, context, info);
                    // } else {
                    //     await this.callHook('afterValidate', action, _, args, context, info);
                    // }

                    await this.callHook(<HookName>`before${capitalize(action)}`, _, args, context, info);

                    //this.validatePermissions(action, roles, args.data);

                    result = await prismaMethod(args, info);

                    console.log('resultresultresultresult',result)
                    context.result = result

                    await this.callHook(<HookName>`after${capitalize(action)}`, _, args, context, info);

                    //this.validatePermissions('read', roles, fieldsList(info));
                }
                if (type === 'query') {
                    await this.callHook('beforeQuery', _, args, context, info);
                    //this.validatePermissions('read', roles, fieldsList(info));
                    result = await prismaMethod(args, info);
                    context.result = result
                    await this.callHook('afterQuery', _, args, context, info);

                }

                console.log('result', result)
                bm('done in ')
                console.log('*****************************************************')
                return result;
            }
        });

        return result;
    }

    register() {
        // TODO: Do we need to implement this method?
    }

    /**
     * Simple wrapper to execute the table hook if exists
     *
     * @param name
     * @param actionType
     * @param _
     * @param args
     * @param context
     * @param info
     */
    private async callHook(name: HookName, _: any, args: any, context: any, info: any) {
        console.log('this.options.hooks', name, this.options.hooks)
        const hookHandler = this.options.hooks && this.options.hooks[name];
        if (hookHandler) {
            await hookHandler(_, args, context, info);
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
    middlewares?: Array<(user: any, context: any, info: any) => Promise<void>>
}

export interface TableShapeOptions extends SchemaOptions, TableSchemaOptions {
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

