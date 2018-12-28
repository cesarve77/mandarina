import { Prisma } from "prisma-binding";
import { ContextParameters } from "graphql-yoga/dist/types";
import { fieldsList } from 'graphql-fields-list';

import { ActionType, AuthArgs } from "../Auth/Auth";
import { Schema, SchemaOptions } from "../Schema/Schema";
import { InvalidActionError } from '../Errors/InvalidActionError';
import { UniqueTableError } from '../Errors/UniqueTableError';
import { TableInstanceNotFound } from "../Errors/TableInstanceNotFound";
import { Mandarina } from "../Mandarina";
import { capitalize } from './utils';
import { FieldsPermissionsError } from '../Errors/FieldsPermissionsError';


const defaultPermissions = {read: {}, create: {}, update: {}, delete: {}};
const defaultActions = Object.keys(defaultPermissions);

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
    private permissions: any;

    /**
     *
     * @param schema
     * @param tableOptions
     */
    constructor(schema: Schema, tableOptions: TableShapeOptions) {
        Table.instances = Table.instances || {};
        this.schema = schema;
        this.schema.extend({
            id: {
                type: String,
                permissions: { read: this.schema.permissions.read, create: 'nobody', update: 'nobody', }
            }
        })
        this.name = this.schema.name;

        if (Table.instances[this.name]) {
            throw new UniqueTableError(this.name);
        }

        this.options = { ...schema.options, ...tableOptions };

        Table.instances[this.name] = this;
    }

    static getInstance(name: string): Table {
        if (!Table.instances[name]) {
            throw new TableInstanceNotFound(name);
        }

        return Table.instances[name];
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
    private async callHook(name: string, actionType: string, _: any, args: any, context: any, info: any) {
        const hookHandler = this.options.hooks && this.options.hooks[name];

        if(hookHandler) {
            await hookHandler(actionType, _, args, context, info);
        }
    }

    getFields() {
        return this.schema.getFields();
    }

    /**
     * Returns the resource schema appliying the authorization and data exposition policy
     *
     * @param action
     * @param role
     *
     * @return Schema
     */
    private getSchema(action: string, role?: string | string[] | null | undefined) {

        const roles = Array.isArray(role) ? role : [role];

        if (!defaultActions.includes(action)) {
            throw new InvalidActionError(action);
        }

        const fields = this.getFields();
        const permissionsByRole = this.getPermissions()[action];
        const allowedFieldsNames = Object.keys(permissionsByRole)
            .filter(k => roles.includes(k))
            .map(k => permissionsByRole[k])
            .reduce((p, c) => p.concat(c), permissionsByRole.everyone);

        return fields
            .filter((fieldName) => allowedFieldsNames.includes(fieldName))
            .reduce((res, fieldName) => ({...res, [fieldName]: this.schema.shape[fieldName]}), {});
    }

    /**
     * Returns the the authorization schema definition for the instance
     *
     * @return Permissions
     */
    getPermissions() {
        const fields = this.getFields();

        if (!this.permissions) {
            this.permissions = defaultPermissions;

            fields.forEach((field) => {
                const def = this.schema.getPathDefinition(field)

                defaultActions.forEach((action) => {
                    def.permissions = def.permissions || {}

                    if (!def.permissions[action]) {
                        this.permissions[action].everyone = this.permissions[action].everyone || []
                        this.permissions[action].everyone.push(field)
                        return
                    }

                    if (def.permissions[action] === 'nobody') return
                    const roles: string[] = def.permissions[action].split('|')
                    roles.forEach((role) => {
                        this.permissions[action][role] = this.permissions[action][role] || []
                        this.permissions[action][role].push(field)
                    })

                })
            });
        }

        return this.permissions;
    }

    /**
     * It apply the fields permissions policy by action and roles, throw an exception if is not a valid request
     *
     * @param action
     * @param role
     * @param model
     */
    validatePermissions(action: string, role: string | string[] | null | undefined, model: string[] | any ): void {
        const fields = this.getFields();
        const allowedFields = Object.keys(this.getSchema(action, role));
        const modelFields = (Array.isArray(model) ? model : Object.keys(model)).filter(f => fields.includes(f));
        const intersection = allowedFields.filter(af => modelFields.includes(af));

        if (modelFields.length > intersection.length) {
            const invalidFields = modelFields.filter(mf => !intersection.includes(mf));
            throw new FieldsPermissionsError(action, invalidFields);
        }
    }

    private flatFields(model: any) {
        const fieldWrappers = ['connect', 'create', 'udpate', 'delete'];
        const composedFields = Object.keys(model).filter(key => {
            const wrapperKey = Object.keys(model[key]).pop() || '';
            return fieldWrappers.includes(wrapperKey);
        });

        if (composedFields.length > 0){
            const mappedFields = composedFields.reduce((p, key) => {
                const wrapperKey = Object.keys(model[key]).pop() || '';

                return {
                    ...p,
                    [key]: model[key][wrapperKey]
                };
            }, {});

            return {
                ...model,
                ...mappedFields
            };
        }

        return model;
    }

    getDefaultActions(type: operationType) {

        const result = {};
        // OperationName for query is user or users, for mutation are createUser, updateUser ....
        const operationNames: string[] = Object.values(this.schema.names[type]);
        const {onBefore, onAfter} = this.options;

        operationNames.forEach((operationName: string) => {
            result[operationName] = async (_: any, args: any = {}, context: Context, info: any) => {
                const middlewares = this.options.middlewares || [];
                const user = await Mandarina.config.getUser(context);
                const subOperationName: ActionType | string = operationName.substr(0, 6)
                const action: ActionType = <ActionType>(['create', 'update', 'delete'].includes(subOperationName) ? subOperationName : 'read')
                const prismaMethod = context.prisma[type][operationName];

                if (middlewares.length > 0) {
                    await Promise.all(middlewares.map((m: any) => m(user, context, info)));
                }

                // TODO: Review the hooks architecture for adding a way to execute hooks of nested operations
                if (type === 'mutation') {
                    this.callHook('beforeValidate', action, _, args, context, info);

                    // TODO: Flatting nested fields operation (context, update, create)
                    const errors = this.schema.validate(this.flatFields(args.data));

                    if (errors.length > 0) {
                        context.errors = errors;
                        await this.callHook('validationFailed', action, _, args, context, info);
                    } else {
                        await this.callHook('afterValidate', action, _, args, context, info);
                    }

                    await this.callHook(`before${capitalize(action)}`, action, _, args, context, info);

                    this.validatePermissions(action, user && user.roles, args.data);

                    context.result = await prismaMethod(args, info);

                    await this.callHook(`after${capitalize(action)}`, action, _, args, context, info);

                    this.validatePermissions('read', user && user.roles, fieldsList(info));
                }

                if (type === 'query') {
                    // TODO: Remove on solve legacy integration on current implementations
                    if (onBefore) {
                        await onBefore(action, _, args, context, info);
                    }

                    await this.callHook('beforeQuery', action, _, args, context, info);

                    this.validatePermissions('read', user && user.roles, fieldsList(info));

                    context.result = await prismaMethod(args, info);

                    await this.callHook('afterQuery', action, _, args, context, info);

                    // TODO: Remove on solve legacy integration on current implementations
                    if (onAfter) {
                        await onAfter(action, _, args, context, info);
                    }
                }

                return context.result;
            }
        });

        return result;
    }


    register() {
        // TODO: Do we need to implement this method?
    }


}

export interface Context extends ContextParameters {
    prisma: Prisma

    [others: string]: any
}

export interface ContextAfter<Result> extends ContextParameters {
    result: Result
}


export type Permission = 'everyone' | 'nobody' | string

export interface Permissions {
    read?: Permission
    create?: Permission
    update?: Permission
    delete?: Permission
    filter?: (this: any, user: { userId: string, roles: string[] }, args: AuthArgs) => Promise<Object> | Object | undefined
}

export interface Hook {
    (actionType: string, _: any, args: any, context: any, info: any): Promise<any> | void | any
}

export type operationType = "mutation" | "query"


export interface TableSchemaOptions {
    virtual?: boolean

    // TODO: Remove on solve legacy integration on current implementations
    onBefore?: Hook
    // TODO: Remove on solve legacy integration on current implementations
    onAfter?: Hook

    hooks?:{
        // Mutation opearion hooks
        beforeValidate?: Hook
        afterValidate?: Hook
        validationFailed?: Hook
        beforeCreate?: Hook
        beforeDelete?: Hook
        beforeUpdate?: Hook
        beforeSave?: Hook
        beforeUpsert?: Hook
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
