import { Prisma } from "prisma-binding";
import { ContextParameters } from "graphql-yoga/dist/types";
import { ActionType } from "mandarina/build/Auth/Auth";
import { Schema } from "mandarina";
import { ErrorFromServerMapper } from "mandarina/src/Schema/Schema";
import { UserType } from "../Mandarina";
import { GraphQLResolveInfo } from "graphql";
/**
 *
 * A Table instance is the representation of the one of several of the followings:
 * Physic table in the data base
 * Form
 * List of results
 */
export declare class Table {
    static instances: {
        [name: string]: Table;
    };
    schema: Schema;
    name: string;
    options: TableSchemaOptions & TableShapeOptions;
    protected static hooks: Hooks;
    static setGlobalHooks: (hooks: Hooks) => void;
    constructor(schema: Schema, tableOptions?: TableShapeOptions);
    static getInstance(name: string): Table;
    getFields(): string[];
    shouldHasManyUpdate(): boolean;
    getDefaultActions(type: operationType): {
        [resolverName: string]: (_: any, args: any, context: Context, info: any) => void;
    };
    insertWhereIntoInfo: (info: GraphQLResolveInfo, user: UserType | null | undefined, isSingleMutation: boolean | undefined, action: "read" | "create" | "update" | "delete", operationName: string) => {
        fields: string[];
        queryString: string;
    };
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
    callHook(schemaName: string, name: HookName, _: any, args: any, context: any, info: GraphQLResolveInfo): Promise<void>;
}
export interface Context extends ContextParameters {
    prisma: Prisma;
    [others: string]: any;
}
export interface Hook {
    (_: any, args: any, context: any, info: any): Promise<any> | void | any;
}
export declare type operationType = "mutation" | "query";
export declare type Hooks = {
    beforeValidate?: Hook;
    afterValidate?: Hook;
    validationFailed?: Hook;
    beforeCreate?: Hook;
    beforeDelete?: Hook;
    beforeUpdate?: Hook;
    beforeSave?: Hook;
    afterCreate?: Hook;
    afterDelete?: Hook;
    afterUpdate?: Hook;
    beforeQuery?: Hook;
    afterQuery?: Hook;
};
export interface TableSchemaOptions {
    virtual?: boolean;
    hooks?: Hooks;
    filters?: Filter[];
}
export declare type Filter = {
    [field: string]: {
        roles: string[];
        operator: string;
        value: any;
    };
};
export interface TableShapeOptions extends TableSchemaOptions {
    errorFromServerMapper?: ErrorFromServerMapper;
    where?: (user: UserType | null | undefined, action: ActionType, operationName: string) => any;
}
export declare type HookName = 'beforeValidate' | 'afterValidate' | 'validationFailed' | 'beforeCreate' | 'beforeDelete' | 'beforeUpdate' | 'afterCreate' | 'afterDelete' | 'afterUpdate' | 'beforeQuery' | 'afterQuery';
