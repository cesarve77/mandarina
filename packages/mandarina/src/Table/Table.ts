import {Prisma} from "prisma-binding";
import {ContextParameters} from "graphql-yoga/dist/types";

import {ActionType, AuthArgs} from "../Auth/Auth";
import {Schema, SchemaOptions} from "../Schema/Schema";
import {sleep} from "./utils";
import {InvalidActionError} from '../Errors/InvalidActionError';
import {UniqueTableError} from '../Errors/UniqueTableError';
import {TableInstanceNotFound} from "../Errors/TableInstanceNotFound";


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
                permissions: {read: this.schema.permissions.read, create: 'nobody', update: 'nobody',}
            }
        })
        this.name = this.schema.name;

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
     * Returns the resource schema appliying the authorization and data exposition policy
     *
     * @param action
     * @param role
     *
     * @return Schema
     */
    getSchema(action: string, role?: string | string[]) {

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

    getDefaultActions(type: operationType) {

        const result = {};
        // OperationName for query is user or users, for mutation are createUser, updateUser ....
        const operationNames: string[] = Object.values(this.schema.names[type]);
        const {onBefore, onAfter} = this.options;

        operationNames.forEach((operationName: string) => {
            result[operationName] = async (_: any, args: any = {}, context: Context, info: any) => {
                const subOperationName: ActionType | string = operationName.substr(0, 6)
                const action: ActionType = <ActionType>(['create', 'update', 'delete'].includes(subOperationName) ? subOperationName : 'read')

                // TODO: deletion
                // const user = await Promise.resolve(Table.config.getUser(context));
                // console.log('user->', operationName,args, user)
                // const fields = Object.keys(flatten({[this.name]: graphqlFields(info)}))
                // if (type === 'mutation') this.validate(args.data,fields)
                // const userId = Table.config.getUserId(context)
                // const restrictionQuery = await this.checkPermissionsTable({type, operationName, userId})
                // await this.checkPermissionsFields({type, operationName, info, userId})
                // if (restrictionQuery) {
                //    let query = args.where || {}
                //    args.where = {AND: [query, restrictionQuery]}
                // }

                if (onBefore) {
                    await onBefore(action, _, args, context, info);
                }

                const result = await context.prisma[type][operationName](args, info);
                context.result = result;

                if (onAfter) {
                    await onAfter(action, _, args, context, info);
                }

                // TODO: remove in production
                await sleep(400);
                return result;
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
    onBefore?: Hook
    onAfter?: Hook
}

export interface TableShapeOptions extends SchemaOptions, TableSchemaOptions {
}
