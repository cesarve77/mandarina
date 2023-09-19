import { ErrorValidator, Validator } from "./ValidatorCreator";
import * as React from "react";
import { ReactElement } from "react";
/**
 * Schema is the base of all components in Mandarina
 *
 * Form schemas mandarina is able to create:
 *
 * - Tables
 * - Form
 * - Lists
 *
 * Schemas are rigid and dynamic, maybe it is the biggest limitation of mandarina, you are no able to build a schema on the fly or programmatically.
 */
export declare class Schema {
    static instances: {
        [actionName: string]: Schema;
    };
    name: string;
    keys: string[];
    shape: SchemaShape;
    permissions: Permissions;
    errorFromServerMapper: ErrorFromServerMapper | undefined;
    indexes: TableIndex[];
    names: Names;
    fields: string[];
    subSchemas: string[];
    private pathDefinitions;
    private original;
    private filePath;
    constructor(shape: UserSchemaShape, options: SchemaOptions);
    static getInstance(name: string): Schema;
    static cleanKey: (key: string) => string;
    extend(shape: UserSchemaShape): void;
    hasPath(field: string): boolean;
    getPathDefinition(field: string, overwrite?: OverwriteDefinition): FieldDefinition;
    getFields(): string[];
    getSubSchemas(): string[];
    clean(model: Model, fields: string[]): void;
    getFilePath(): string;
    validate(model: Model, fields: string[], overwrite?: Overwrite): ErrorValidator[];
    getSchemaPermission(roles: string[] | undefined, action: Action): boolean;
    getFieldPermission(field: string, action: Action, roles?: string[]): boolean;
    _getKeyDefinition(key: string): FieldDefinition;
    static mapValidators: (validators: (string | Validator | ValidatorFinder)[]) => Validator[];
    applyDefinitionsDefaults(definition: UserFieldDefinition, key: string): FieldDefinition;
    validateQuery: (fields: any, roles: string[]) => void;
    validateConnection: (roles: string[]) => void;
    validateMutation: (action: "read" | "create" | "update" | "delete", mutation: any, roles?: string[] | undefined) => void;
    /**
     * Mutate the model,with all keys  proper types and null for undefined
     * @param model
     * @param fields
     * @param removeExtraKeys
     */
    protected _clean(model: Model | undefined | null, fields: string[], removeExtraKeys?: boolean): void;
    private _getPathDefinition;
    getChainedLabel(key: string): string;
    private generatePathDefinition;
    private _validate;
}
export interface Model {
    id?: string;
    [key: string]: any;
}
export declare function Integer(): undefined;
export declare namespace Integer {
    const type: string;
}
export declare type ErrorFromServerMapper = (field: string, error: any) => string | undefined;
export interface TableIndex {
    type: 'UNIQUE' | 'INDEX' | 'ID';
    fields: {
        name: string;
        options?: string;
    }[];
}
export interface SchemaOptions {
    name: string;
    errorFromServerMapper?: ErrorFromServerMapper;
    permissions?: Permissions;
    indexes?: TableIndex[];
}
export interface SchemaShape {
    [key: string]: FieldDefinition;
}
export interface UserSchemaShape {
    [fieldName: string]: UserFieldDefinition;
}
export declare type Native = (props: any) => any;
export declare type Types = Native | string | Array<string> | Array<Native>;
declare type Where = any;
export declare type FilterMethod = (filter: any) => Where;
export declare type FilterComponent = ((props: any) => ReactElement) | null;
export interface CellComponentProps {
    columnIndex: number;
    rowIndex: number;
    data: any[];
    field: string;
    [rest: string]: any;
}
export declare type CellComponent = React.ComponentType<CellComponentProps & any>;
export interface UserFieldDefinitionCommon {
    label?: LabelOrResolver;
    description?: string;
    validators?: Array<Validator | string | ValidatorFinder>;
    defaultValue?: any;
    transformValue?: (value: any) => any;
    form?: {
        component?: React.Component;
        props?: {
            placeholder?: string;
            col?: false | number | any;
            initialCount?: number;
            transform?: (value: any) => any;
            [rest: string]: any;
        };
    };
    list?: {
        hidden?: boolean;
        filterMethod?: FilterMethod;
        filterComponent?: FilterComponent;
        CellComponent?: CellComponent;
        loadingElement?: ReactElement;
        noFilter?: boolean;
        width?: number | string;
        props?: any;
        noSort?: boolean;
    };
    table?: {
        default?: any;
        rename?: string;
        unique?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        relation?: {
            type?: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
            owner?: true;
            link?: 'INLINE' | 'TABLE';
            name?: string;
            onDelete?: 'SET_NULL' | 'CASCADE';
        };
        scalarList?: {
            strategy: "RELATION" | "EMBEDDED";
        };
    };
    permissions?: Permissions;
}
export interface UserFieldDefinition extends UserFieldDefinitionCommon {
    type: Types;
}
export interface ValidatorFinder {
    [validator: string]: any;
}
export interface FieldDefinitionTable extends FieldDefinitionCommon {
    isTable: true;
    type: string;
}
export interface FieldDefinitionNative extends FieldDefinitionCommon {
    isTable: false;
    type: Native;
}
export declare type FieldDefinition = FieldDefinitionNative | FieldDefinitionTable;
export interface FieldDefinitionCommon extends UserFieldDefinitionCommon {
    key: string;
    label: Label;
    description?: string;
    validators: Array<Validator>;
    defaultValue: any;
    transformValue: (value: any) => any;
    isArray: boolean;
    form: {
        component?: React.Component;
        props?: {
            placeholder?: string;
            col?: false | number | any;
            initialCount?: number;
            transform?: (value: any) => any;
            [rest: string]: any;
        };
    };
    list: {
        hidden?: boolean;
        filterMethod?: FilterMethod;
        filterComponent?: FilterComponent;
        CellComponent?: CellComponent;
        loadingElement?: ReactElement;
        noFilter?: boolean;
        width?: number | string;
        props?: any;
        noSort?: boolean;
    };
    table: {
        default?: any;
        rename?: string;
        unique?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        relation?: {
            type?: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
            owner?: true;
            link?: 'INLINE' | 'TABLE';
            name?: string;
            onDelete?: 'SET_NULL' | 'CASCADE';
        };
        scalarList?: {
            strategy: "RELATION" | "EMBEDDED";
        };
    };
    permissions: Permissions;
}
export interface Overwrite {
    [fields: string]: OverwriteDefinition;
}
export interface OverwriteDefinition {
    type?: Native | string | Array<string> | Array<Native>;
    label?: Label;
    description?: string;
    validators?: Array<Validator | string | ValidatorFinder>;
    defaultValue?: (value: any) => any;
    form?: {
        initialCount?: number;
        transform?: (value: any) => any;
        component?: React.Component;
        placeholder?: string;
        col?: false | number | any;
        props?: any;
    };
    list?: {
        hidden?: boolean;
        filterMethod?: FilterMethod;
        filterComponent?: FilterComponent;
        CellComponent?: CellComponent;
        loadingElement?: ReactElement;
        noFilter?: boolean;
        width?: number | string;
        props?: any;
        noSort?: boolean;
    };
}
export declare type Label = string | false;
export declare type LabelResolver = (definition: UserFieldDefinition) => string;
export declare type LabelOrResolver = Label | LabelResolver | undefined;
export interface Names {
    query: {
        single: string;
        plural: string;
        connection: string;
    };
    mutation: {
        create: string;
        update: string;
        delete: string;
        updateMany: string;
        deleteMany: string;
    };
    orderBy: string;
    input: {
        where: {
            single: string;
            plural: string;
            connection: string;
        };
        create: string;
        update: string;
    };
}
export declare type Permission = ('everybody' | 'nobody' | string)[];
export interface Permissions {
    read?: Permission;
    create?: Permission;
    update?: Permission;
    delete?: Permission;
}
export declare type Action = keyof Permissions;
export {};
