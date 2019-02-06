import {Prisma} from "prisma-binding";
import {ContextParameters} from "graphql-yoga/dist/types";

import {ActionType} from "mandarina/build/Auth/Auth";
import {FieldDefinition, SchemaOptions} from "mandarina/build/Schema/Schema";
import {Schema} from "mandarina";
import {InvalidActionError} from 'mandarina/build/Errors/InvalidActionError';
import {UniqueTableError} from 'mandarina/build/Errors/UniqueTableError';
import {TableInstanceNotFound} from "mandarina/build/Errors/TableInstanceNotFound";
import Mandarina from "../Mandarina";
import {capitalize} from 'mandarina/build/Schema/utils';
import {FieldsPermissionsError} from 'mandarina/build/Errors/FieldsPermissionsError';
import {MissingIdTableError} from "mandarina/build/Errors/MissingIDTableError";


const getDefaultPermissions = () => ({read: {}, create: {}, update: {}, delete: {}});
const defaultActions = Object.keys(getDefaultPermissions());

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
    private permissions: {
        read: { [role: string]: string[] }
        create: { [role: string]: string[] }
        update: { [role: string]: string[] }
    };

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

    /**
     * Returns the the authorization schema definition for the instance
     *
     * @return Permissions
     */
    getPermissions() {
        const fields = this.getFields();
        if (!this.permissions) {
            this.permissions = getDefaultPermissions();

            fields.forEach((field) => {
                const def = this.schema.getPathDefinition(field)
                const parentPath = field.split('.').shift() as string
                let parentDef: FieldDefinition | undefined
                if (parentPath) {
                    parentDef = this.schema.getPathDefinition(parentPath)
                }


                defaultActions.forEach((action) => {
                    const parentRoles = parentDef && parentDef.permissions[action]
                    const roles: string[] = def.permissions[action]
                    if ((parentRoles && parentRoles.includes('nobody')) || (roles && roles.includes('nobody'))) { // if the first parent has nobody the there no permission for any children
                        return
                    }

                    if (!roles && !parentRoles) {
                        this.permissions[action].everyone = this.permissions[action].everyone || []
                        this.permissions[action].everyone.push(field)
                        return
                    } else if (roles) {
                        roles.forEach((role) => {
                            if (parentRoles && parentRoles.includes(role)) {
                                this.permissions[action][role] = this.permissions[action][role] || []
                                this.permissions[action][role].push(field)
                            } else {
                                this.permissions[action][role] = this.permissions[action][role] || []
                                this.permissions[action][role].push(field)
                            }

                        })

                    }
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

    getDefaultActions(type: operationType) {

        const result = {};
        // OperationName for query is user or users, for mutation are createUser, updateUser ....
        const operationNames: string[] = Object.values(this.schema.names[type]);
        operationNames.forEach((operationName: string) => {
            result[operationName] = async (_: any, args: any = {}, context: Context, info: any) => {
                let time = new Date().getTime()
                const bm = (...description: any) => {
                    if (description) {
                        console.log(description, new Date().getTime() - time)
                    }
                    time = new Date().getTime()
                }
                bm()
                const middlewares = this.options.middlewares || [];
                const user = await Mandarina.config.getUser(context);
                const subOperationName: ActionType | string = operationName.substr(0, 6)
                const action: ActionType = <ActionType>(['create', 'update', 'delete'].includes(subOperationName) ? subOperationName : 'read')
                const prismaMethod = context.prisma[type][operationName];
                //const roles = user && user.roles
                if (middlewares.length > 0) {
                    await Promise.all(middlewares.map((m: any) => m(user, context, info)));
                }
                let result: any
                // TODO: Review the hooks architecture for adding a way to execute hooks of nested operations
                if (type === 'mutation') {
                    this.callHook('beforeValidate', _, args, context, info);

                    //TODO: Flatting nested fields operation (context, update, create)
                    // console.log('123123123',this.flatFields(args.data))
                    // const errors = this.schema.validate(this.flatFields(args.data));

                    // if (errors.length > 0) {
                    //     await this.callHook('validationFailed', action, _, args, context, info);
                    // } else {
                    //     await this.callHook('afterValidate', action, _, args, context, info);
                    // }

                    await this.callHook(<HookName>`before${capitalize(action)}`,  _, args, context, info);

                    //this.validatePermissions(action, roles, args.data);

                    result = await prismaMethod(args, info);
                    context.result = result

                    await this.callHook(<HookName>`after${capitalize(action)}`,  _, args, context, info);

                    //this.validatePermissions('read', roles, fieldsList(info));
                }
                if (type === 'query') {
                    await this.callHook('beforeQuery',  _, args, context, info);
                    //this.validatePermissions('read', roles, fieldsList(info));
                    result = await prismaMethod(args, info);
                    context.result = result
                    await this.callHook('afterQuery',  _, args, context, info);

                }
                bm('done')

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
    private async callHook(name: HookName,  _: any, args: any, context: any, info: any) {
        const hookHandler = this.options.hooks && this.options.hooks[name];
        if (hookHandler) {
            await hookHandler(_, args, context, info);
        }
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
    ( _: any, args: any, context: any, info: any): Promise<any> | void | any
}

export type operationType = "mutation" | "query"


export interface TableSchemaOptions {
    virtual?: boolean
    hooks?: {
        // Mutation opearion hooks
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

