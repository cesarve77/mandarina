// @ts-ignore
import mapValues from 'lodash.mapvalues';
import * as inflection from "inflection";
import {ErrorValidator, Validator, ValidatorCreator} from "./ValidatorCreator";
import {extraKey, isDate, isInteger, isNumber, isString, required} from "./Validators";
import {capitalize, forceType, hasValidator, pluralize, singularize} from "./utils";
import {UniqueSchemaError} from '../Errors/UniqueSchemaError';
import {SchemaInstanceNotFound} from '../Errors/SchemaInstanceNotFound';
import {getDecendents} from "../utils";
import * as React from "react";


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

const getDefaultPermissions = () => ({read: {}, create: {}, update: {}, delete: {}});
const defaultActions = Object.keys(getDefaultPermissions());


export class Schema {
    static instances: { [actionName: string]: Schema };
    public name: string
    public keys: string[]
    public shape: SchemaShape;
    public permissions: Permissions;
    public options: InstanceOptions
    public errorFromServerMapper: ErrorFromServerMapper | undefined
    public arraysFields: string[] = []
    public names: Names;
    private pathDefinitions: { [key: string]: FieldDefinition } = {}
    private fields: string[]
    private original: Model;
    private filePath: string;
    private rolePermissions: {
        read: { [role: string]: string[] }
        create: { [role: string]: string[] }
        update: { [role: string]: string[] }
    };

    constructor(shape: UserSchemaShape, options: SchemaOptions) {
        const {name, recursive = [], errorFromServerMapper, permissions} = options;
        this.name = name;

        Schema.instances = Schema.instances || {};
        if (Schema.instances[this.name]) {
            throw new UniqueSchemaError(this.name);
        }

        Schema.instances[this.name] = this;

        this.errorFromServerMapper = errorFromServerMapper;
        this.options = {recursive};
        this.permissions = permissions || {};
        this.shape = mapValues(shape, (field, key) => this.applyDefinitionsDefaults(field, key));
        this.keys = Object.keys(this.shape);
        if (!this.keys.includes('id')) this.extend({id: {type: String}})
        this.filePath = this.getFilePath()
        const single = singularize(this.name);
        const singleUpper = capitalize(single);
        const plural = pluralize(this.name);
        const pluralUpper = capitalize(plural);
        const connection = `${plural}Connection`;

        this.names = {
            // Example user, users, usersConnection
            query: {single, plural, connection},
            mutation: {
                create: `create${singleUpper}`,
                update: `update${singleUpper}`,
                delete: `delete${singleUpper}`,
                updateMany: `updateMany${pluralUpper}`,
                deleteMany: `deleteMany${pluralUpper}`
            },
            input: {
                where: {
                    single: `${singleUpper}WhereUniqueInput!`,
                    plural: `${singleUpper}WhereInput`,
                    connection: `${singleUpper}WhereInput`,
                },
                create: `${singleUpper}CreateInput!`,
                update: `${singleUpper}UpdateInput!`,
            }
        };
    }

    static getInstance(name: string): Schema {
        if (!Schema.instances[name]) {
            throw new SchemaInstanceNotFound(name);
        }

        return Schema.instances[name];
    }

    extend(shape: UserSchemaShape) {
        this.shape = {
            ...this.shape,
            ...mapValues(shape, (def, key) => this.applyDefinitionsDefaults(def, key))
        };
        this.keys = Object.keys(this.shape);
    }

    getFieldDefinition(key: string): FieldDefinition {

        return {...this.shape[key]};
    }

    getPathDefinition(key: string): FieldDefinition {
        //key=key.replace(/\.\d+/,'')
        if (!this.pathDefinitions[key]) {
            this.pathDefinitions[key] = this.generatePathDefinition(key);
        }

        return this.pathDefinitions[key];
    }

    getFields(): string[] {
        if (!this.fields) {
            this.fields = this._getFields();
        }

        return this.fields;
    }

    clean(model: Model, fields = this.getFields()) {
        this.original = model;
        this._clean(model, fields);
    }

    getFilePath() {
        if (!this.filePath) {
            const origPrepareStackTrace = Error.prepareStackTrace
            Error.prepareStackTrace = function (_, stack) {
                return stack
            }
            const err = new Error()
            const stack = err.stack
            Error.prepareStackTrace = origPrepareStackTrace
            const path = require('path')
            // @ts-ignore
            if (!stack || !stack[2] || !stack[2].getFileName) return ''
            // @ts-ignore
            this.filePath = path.dirname(stack[2].getFileName())
        }
        return this.filePath
    }

    validate(model: Model, fields: string[] = this.getFields()): ErrorValidator[] {
        this.clean(model, fields)
        return this._validate(model, '', [{schema: this.name, path: ''}], model);
    }

    /**
     * Returns the the authorization schema definition for the instance
     *
     * @return Permissions
     */
    getPermissions() {
        const fields = this.getFields();
        if (!this.rolePermissions) {
            this.rolePermissions = getDefaultPermissions();

            fields.forEach((field) => {
                const def = this.getPathDefinition(field)
                const parentPath = field.split('.').shift() as string
                let parentDef: FieldDefinition | undefined
                if (parentPath) {
                    parentDef = this.getPathDefinition(parentPath)
                }

                defaultActions.forEach((action) => {
                    const parentRoles = parentDef && parentDef.permissions[action]
                    const roles: string[] = def.permissions[action]
                    if ((parentRoles && parentRoles.includes('nobody')) || (roles && roles.includes('nobody'))) { // if the first parent has nobody the there no permission for any children
                        return
                    }

                    if (!roles && !parentRoles) {
                        this.rolePermissions[action].everyone = this.rolePermissions[action].everyone || []
                        this.rolePermissions[action].everyone.push(field)
                        return
                    } else if (roles) {
                        roles.forEach((role) => {
                            if (parentRoles && parentRoles.includes(role)) {
                                this.rolePermissions[action][role] = this.rolePermissions[action][role] || []
                                this.rolePermissions[action][role].push(field)
                            } else {
                                this.rolePermissions[action][role] = this.rolePermissions[action][role] || []
                                this.rolePermissions[action][role].push(field)
                            }

                        })

                    }
                })
            });
        }
        return this.rolePermissions;
    }

    /**
     * Mutate the model,with all keys  proper types and null for undefined
     * TODO: Refactor to prevent mutation, fix it creating a new cloned model and returning it
     * @param model
     * @param transform
     * @param removeExtraKeys
     */
    protected _clean(model: Model | undefined | null, fields: string[], removeExtraKeys = true) {
        if (removeExtraKeys && model && typeof model === 'object') {
            Object.keys(model).forEach((key) => {
                if (!this.keys.includes(key)) {
                    delete model[key]
                }
            });
        }

        this.keys.forEach((key): any => {
            if (key !== '___typename' && fields.every((field) => field !== key && field.indexOf(key + '.') < 0)) {
                return model && delete model[key]
            }
            const definition = this.getFieldDefinition(key);

            if (!definition.isTable && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = forceType(model[key], definition.type);
                model[key] = model[key] === 0 ? 0 : model[key] || definition.defaultValue;

            } else if (definition.isTable && typeof model === 'object' && model !== undefined && model !== null) {
                if (model[key] !== 0 && !model[key]) {
                    return model[key] = definition.defaultValue;
                }
                const schema = Schema.getInstance(definition.type)
                schema._clean(model[key], getDecendents(fields, key));
                return;

            } else if (definition.isArray && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = forceType(model[key], Array)

                if (definition.isTable) {
                    const schema = Schema.getInstance(definition.type)
                    model[key] = model[key].map((value: any) => {
                        schema._clean(value, getDecendents(fields, key))
                        return value
                    });
                } else {
                    model[key] = model[key].map((value: any) => forceType(value, definition.type));
                }
                return;
            }


            if (model) {
                model[key] = definition.transformValue.call({
                    model: this.original,
                    siblings: model
                }, model[key]);
            }
        })
    }

    private applyDefinitionsDefaults(definition: UserFieldDefinition, key: string): FieldDefinition {
        const fieldDefinition = <FieldDefinition>{};

        if (!definition.validators) {
            definition.validators = [];
        }
        //insert  type Validator on top

        fieldDefinition.validators = definition.validators.map((validator: Validator | string | ValidatorFinder) => {

            if (typeof validator === 'string') { //is is a string i found the Validator constructor in the instances
                return ValidatorCreator.getInstance(validator).getValidatorWithParam(true);
            } else if (typeof validator === 'object') {//if is a object is because the only property is the instance validatorName and the value is the param to pass to getValidatorWithParam
                const name = Object.keys(validator)[0];
                const param = validator[name];
                return ValidatorCreator.getInstance(name).getValidatorWithParam(param);
            }

            return <Validator>validator;
        });

        const isNumberValidator = isNumber.getValidatorWithParam();
        const isDateValidator = isDate.getValidatorWithParam();
        const isIntegerValidator = isInteger.getValidatorWithParam();
        const isStringValidator = isString.getValidatorWithParam();
        const isRequired = required.getValidatorWithParam();

        if (definition.type === Number && (!hasValidator(fieldDefinition.validators, isNumberValidator.validatorName))) {
            fieldDefinition.validators.unshift(isNumberValidator);
        }

        if (definition.type === Date && (!hasValidator(fieldDefinition.validators, isDateValidator.validatorName))) {
            fieldDefinition.validators.unshift(isDateValidator);
        }

        if (definition.type === Integer && (!hasValidator(fieldDefinition.validators, isIntegerValidator.validatorName))) {
            fieldDefinition.validators.unshift(isIntegerValidator);
        }

        if (definition.type === String && (!hasValidator(fieldDefinition.validators, isStringValidator.validatorName))) {
            fieldDefinition.validators.unshift(isStringValidator);
        }

        if (Array.isArray(definition.type) && typeof definition.type[0] !== 'string' && (!hasValidator(fieldDefinition.validators, isRequired.validatorName))) {
            fieldDefinition.validators.unshift(isRequired);
        }

        // set default -> default values
        fieldDefinition.isArray = false
        fieldDefinition.isTable = false
        if (Array.isArray(definition.type)) {
            fieldDefinition.isArray = true
            if (typeof definition.type[0] === 'string') {
                fieldDefinition.isTable = true
                fieldDefinition.type = definition.type[0]
                fieldDefinition.defaultValue = definition.defaultValue || {};
            } else {
                fieldDefinition.type = definition.type[0] as Native
                fieldDefinition.defaultValue = definition.defaultValue || null;
            }

        } else if ((typeof definition.type === 'string')) {
            fieldDefinition.isTable = true
            fieldDefinition.type = definition.type as string
            fieldDefinition.defaultValue = definition.defaultValue || {};
        } else {
            fieldDefinition.type = definition.type
            fieldDefinition.defaultValue = definition.defaultValue === 0 ? 0 : definition.defaultValue || null;
        }


        definition.permissions = definition.permissions || this.permissions;
        fieldDefinition.permissions = definition.permissions;
        fieldDefinition.permissions.read = fieldDefinition.permissions.read || this.permissions.read;
        fieldDefinition.permissions.create = fieldDefinition.permissions.create || this.permissions.create;
        fieldDefinition.permissions.update = fieldDefinition.permissions.update || this.permissions.update;
        fieldDefinition.permissions.delete = fieldDefinition.permissions.delete || this.permissions.delete;
        fieldDefinition.form = definition.form || {};
        fieldDefinition.list = definition.list || {};
        fieldDefinition.table = definition.table || {};
        fieldDefinition.transformValue = definition.transformValue || ((value: any): any => value);

        if (typeof definition.label === 'string') {
            fieldDefinition.label = definition.label;
        }

        if (typeof definition.label === 'function') {
            fieldDefinition.label = definition.label(definition);
        }

        if (typeof fieldDefinition.label !== 'string') {
            fieldDefinition.label = inflection.transform(key, ['underscore', 'humanize']);
        }
        return fieldDefinition;
    }

    private generatePathDefinition(key: string): FieldDefinition {
        if (key==='parents.0'){
            console.log('')
        }
        if (key==='parents.0.0'){
            throw new Error('parents.0.0')
        }
        const paths = key.split('.')
        let schema: Schema = this;

        let def: FieldDefinition = schema.getFieldDefinition(paths[0])
        paths.forEach((path) => {
            if (!path.match(/\$|^\d+$/)) { //example user.0
                def = schema.getFieldDefinition(path)
                if (def.isTable) {
                    schema = Schema.getInstance(def.type)
                }
            }
        });
        return def
    }

//TODO VER QUE CONO ES ESTO, por que ahora todas tienen id ***** **** TODO WARNING
    private _isConnectingTable = (value: any) => {
        return (value && value.hasOwnProperty && value.hasOwnProperty('id') && typeof value.id === 'string')
    }

    private _validate(model: Model, parent: string = '', pathHistory: { schema: string, path: string }[] = [], originalModel: Model): ErrorValidator[] {
        console.log('_validate')
        let errors: ErrorValidator[] = [];
        const shape = {...model};

        this.keys.forEach((key): any => {

            delete shape[key];
            const dot = parent ? '.' : '';
            const path: string = `${parent}${dot}${key}`;
            const definition = this.getFieldDefinition(key);
            const value: any = model && model[key];


            if (definition.isArray) {
                //check arrayValidators (min array count for example)
                for (const validator of definition.validators) {
                    if (!validator.arrayValidator) continue
                    const instance = new validator({key, path, definition, value});
                    const error = instance.validate(originalModel);
                    if (error) {
                        return errors.push(error);
                    }
                }
                //Check no array validators
                // TODO: Tal vez es mejor chequear en default value que siempre tenga un valor
                if (definition.isTable && value) {
                    const schema = Schema.getInstance(definition.type)
                    const schemaName = schema.name;
                    let internalErrors: ErrorValidator[] = [];
                    value.forEach((value: any, i: number) => {
                        if (!pathHistory.some(({schema, path}) => schemaName === schema) && !this._isConnectingTable(value)) {
                            internalErrors = [...internalErrors, ...schema._validate(value, `${path}.${i}`, pathHistory, originalModel)];
                        }
                        pathHistory.push({path, schema: schemaName});
                    });
                    errors = [...errors, ...internalErrors];
                } else if (value) {
                    // TODO: Es mejor chquear en default value que siempre tenga un valor
                    value.forEach((value: any, i: number): any => {
                        for (const validator of definition.validators) {
                            if (validator.arrayValidator) continue
                            const instance = new validator({key, path, definition, value});
                            const error = instance.validate(originalModel);

                            if (error) {
                                ;
                                return errors.push(error);
                            }
                        }
                    })
                }

                return errors;
            } else if (definition.isTable) {
                const schema = Schema.getInstance(definition.type)
                const schemaName = schema.name;
                let internalErrors: ErrorValidator[] = [];
                // Check if we are entering in a recursive table, if actual table has been used before, reviewing the history
                if (!pathHistory.some(({schema, path}) => schemaName === schema) && !this._isConnectingTable(value)) {
                    internalErrors = schema._validate(value, path, pathHistory, originalModel);
                }
                pathHistory.push({path: path, schema: schemaName});

                return errors = [...errors, ...internalErrors];
            }

            for (const validator of definition.validators) {
                if (validator.arrayValidator) continue
                const instance = new validator({key, path, definition, value});
                const error = instance.validate(originalModel);

                if (error) {
                    return errors.push(error);
                }
            }


        });

        const extraKeys = Object.keys(shape);

        if (extraKeys.length) {
            extraKeys.forEach(key => {
                if (key === 'id') return
                const Validator = extraKey.getValidatorWithParam()
                // Mock definition for a not existent key
                const definition = this.applyDefinitionsDefaults({label: key, type: String}, key)

                errors.push(<ErrorValidator>new Validator({
                    key,
                    definition,
                    path: parent,
                    value: key
                }).validate(originalModel))
            })


        }

        return errors;
    }

    private _getFields(parent: string = '', pathHistory: { table: string, path: string }[] = []): string[] {
        let fields: string[] = [];
        let schema = this;
        schema.keys.forEach(key => {

            const dot = parent ? '.' : '';
            const path = `${parent}${dot}${key}`;
            const def = schema.getFieldDefinition(key);
            let table: Schema | undefined;

            if (def.isArray) {
                this.arraysFields.push(path);

            }
            if (def.isTable) {
                table = Schema.getInstance(def.type)
                pathHistory.push({path: path, table: this.name});
                let fieldsInternal: string[] = [];
                const tableName = table.name;

                // Check if we are entering in a recursive table, if actual table has been used before, reviewing the history
                if (!pathHistory.some(({table}) => tableName === table)) {
                    fieldsInternal = table._getFields(path, pathHistory);
                }

                // To intro a path in table options to continue deep in get fields
                fields = [...fields, ...fieldsInternal];
            } else {
                fields.push(path);
            }
        });

        return fields;
    }


}

export interface Model {
    id?: string

    [key: string]: any
}

export function Integer(): undefined {
    return undefined
}

export namespace Integer {
    export const type: string = 'Int'
}

export type ErrorFromServerMapper = (field: string, error: any) => string | undefined;

export interface InstanceOptions {
    recursive?: string[]
}

export interface SchemaOptions {
    name: string
    recursive?: string[]
    errorFromServerMapper?: ErrorFromServerMapper
    permissions?: Permissions
}

export interface SchemaShape {
    [key: string]: FieldDefinition
}

export interface UserSchemaShape {
    [fieldName: string]: UserFieldDefinition
}

export type Native = (props: any) => any

export type Types = Native | string | Array<string> | Array<Native>

type Where = any

export type FilterMethod = (filter: any) => Where

export type FilterComponent = ((props: any) => JSX.Element) | null


export interface CellComponentProps {
    columnIndex: number
    rowIndex: number
    data: any[]
    field: string

    [rest: string]: any
}

export type CellComponent = React.ComponentType<CellComponentProps> //React.ComponentClass<CellComponentProps> | React.ComponentType<CellComponentProps> | React.FunctionComponent<CellComponentProps> | ReactNode

export interface UserFieldDefinitionCommon {
    label?: LabelOrResolver
    description?: string
    validators?: Array<Validator | string | ValidatorFinder>
    defaultValue?: any
    transformValue?: (value: any) => any
    form?: {
        initialCount?: number
        transform?: (allowedValues: string[]) => string[]
        component?: React.Component
        placeholder?: string
        col?: false | number | any
        props?: any
    }
    list?: {
        hidden?: true
        filterMethod?: FilterMethod
        filterComponent?: FilterComponent
        CellComponent?: CellComponent
        loadingElement?: JSX.Element
        filter?: boolean
        width?: number
        props?: any

    }
    table?: {
        default?: any
        rename?: string
        unique?: boolean,
        relation?: string | {
            link?: 'INLINE' | 'TABLE'
            name?: string
            onDelete?: 'SET_NULL' | 'CASCADE'
        }
        scalarList?: { strategy: "RELATION" | "EMBEDDED" }
    },
    permissions?: Permissions
}

export interface UserFieldDefinition extends UserFieldDefinitionCommon {
    type: Types

}

export interface ValidatorFinder {
    [validator: string]: any
}

export interface FieldDefinitionTable extends FieldDefinitionCommon {
    isTable: true
    type: string
}


export interface FieldDefinitionNative extends FieldDefinitionCommon {
    isTable: false
    type: Native
}

export type FieldDefinition = FieldDefinitionNative | FieldDefinitionTable


export interface FieldDefinitionCommon extends UserFieldDefinitionCommon {
    label: Label
    description?: string
    validators: Array<Validator>
    defaultValue: any
    transformValue: (value: any) => any
    isArray: boolean

    form: {
        initialCount?: number
        transform?: (allowedValues: string[]) => string[]
        component?: React.Component
        placeholder?: string
        col?: false | number | any
        props?: any

    }
    list: {
        hidden?: true
        filterMethod?: FilterMethod
        filterComponent?: FilterComponent
        CellComponent?: CellComponent
        loadingElement?: JSX.Element
        filter?: boolean
        width?: number
        props?: any
    }
    table: {
        default?: any
        rename?: string
        unique?: boolean,
        relation?: string | {
            link?: 'INLINE' | 'TABLE'
            name?: string
            onDelete?: 'SET_NULL' | 'CASCADE'
        }
        scalarList?: { strategy: "RELATION" | "EMBEDDED" }
    },
    permissions: Permissions
}


export interface OverwriteDefinition {
    type?: Native | string | Array<string> | Array<Native>,
    label?: Label
    description?: string
    validators?: Array<Validator>
    defaultValue?: any
    form?: {
        initialCount?: number
        transform?: (allowedValues: string[]) => string[]
        component?: React.Component
        placeholder?: string
        col?: false | number | any
        props?: any
    }
    list?: {
        hidden?: true
        filterMethod?: FilterMethod
        filterComponent?: FilterComponent
        CellComponent?: CellComponent
        loadingElement?: JSX.Element
        filter?: boolean
        width?: number
        props?: any
    }
}

export type Label = string | false;
export type LabelResolver = (definition: UserFieldDefinition) => string;
export type LabelOrResolver = Label | LabelResolver | undefined;


export interface Names {
    query: { single: string, plural: string, connection: string },//user, users, usersConnection
    mutation: {
        create: string,
        update: string,
        delete: string,
        updateMany: string,
        deleteMany: string
    },
    input: {
        where: {
            single: string,
            plural: string,
            connection: string,
        },
        create: string,
        update: string,
    }
}

export type Permission = ['everyone'] | ['nobody'] | string[]

export interface Permissions {
    read?: Permission
    create?: Permission
    update?: Permission
    delete?: Permission
}


