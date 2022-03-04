import {cloneDeep, get, mapValues, merge} from 'lodash';
import * as inflection from "inflection";
import {ErrorValidator, Validator, ValidatorCreator} from "./ValidatorCreator";
import {isDate, isInteger, isNumber, isString} from "./Validators";
import {capitalize, forceType, hasValidator, pluralize, singularize} from "./utils";
import {UniqueSchemaError} from '../Errors/UniqueSchemaError';
import {SchemaInstanceNotFound} from '../Errors/SchemaInstanceNotFound';
import {getDecendentsDot, insertParents} from "../utils";
import * as React from "react";
import {flatten} from "flat";
import {ReactElement} from "react";


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


export class Schema {
    static instances: { [actionName: string]: Schema };
    public name: string
    public keys: string[]
    public shape: SchemaShape;
    public permissions: Permissions;
    public errorFromServerMapper: ErrorFromServerMapper | undefined
    public names: Names;
    fields: string[]
    subSchemas: string[]
    private pathDefinitions: { [key: string]: FieldDefinition } = {}
    private original: Model;
    private filePath: string;

    constructor(shape: UserSchemaShape, options: SchemaOptions) {
        const {name, errorFromServerMapper, permissions} = options;
        this.name = name;

        Schema.instances = Schema.instances || {};
        if (Schema.instances[this.name]) {
            throw new UniqueSchemaError(this.name);
        }

        Schema.instances[this.name] = this;

        this.errorFromServerMapper = errorFromServerMapper;
        this.permissions = permissions || {};
        this.shape = mapValues(shape, (field, key) => this.applyDefinitionsDefaults(field, key));
        this.keys = Object.keys(this.shape);
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
            orderBy: `${singleUpper}OrderByInput`,
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

    static cleanKey = (key: string) => key.replace(/\.\d+/g, '') //clean key

    extend(shape: UserSchemaShape) {
        this.shape = {
            ...this.shape,
            ...mapValues(shape, (def, key) => this.applyDefinitionsDefaults(def, key))
        };
        this.keys = Object.keys(this.shape);
    }

    hasPath(field: string): boolean {
        const definition = this._getPathDefinition(field)
        return !(!definition || Object.keys(definition).length === 0)
    }

    getPathDefinition(field: string, overwrite?: OverwriteDefinition): FieldDefinition {
        const definition = this._getPathDefinition(field, overwrite)
        if (!definition) {
            throw new Error(`Field "${field}" not found in ${this.name}`)
        }
        return definition
    }

    getFields(): string[] {
        if (this.fields) return this.fields
        this.fields = this.keys.filter(field => !this.getPathDefinition(field).isTable);
        return this.fields
    }

    getSubSchemas(): string[] {
        if (this.subSchemas) return this.subSchemas
        this.subSchemas = this.keys.filter(field => this.getPathDefinition(field).isTable);
        return this.subSchemas
    }

    clean(model: Model, fields: string[]) {
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

    validate(model: Model, fields: string[], overwrite?: Overwrite): ErrorValidator[] {
        fields = insertParents(fields)
        this.clean(model, fields)
        return this._validate(model, fields, overwrite);
    }

    getSchemaPermission(roles: string[] = [], action: Action) {
        if (!this.permissions[action]) return true
        const rolesWithEverybody = [...roles, 'everybody']
        for (const role of rolesWithEverybody) {
            // @ts-ignore
            if (this.permissions[action].includes(role)) return true
        }
        return false
    }

    getFieldPermission(field: string, action: Action, roles?: string[]) {

        const rolesWithEverybody = [...(roles || []), 'everybody']
        // let parentPath = field
        // let lastDot = parentPath.lastIndexOf('.')
        // let parentRoles: string[] = []
        // while (lastDot >= 0) {
        //     parentPath = parentPath.substring(0, lastDot)
        //     lastDot = parentPath.lastIndexOf('.')
        //     console.log('parentPath', parentPath)
        //     console.log('lastDot', lastDot)
        //     if (parentPath) {
        //         const parentDef = this.getPathDefinition(parentPath)
        //         const parentPermissions = parentDef.permissions[action]
        //         if (parentPermissions) parentRoles.concat(parentPermissions)
        //     }
        // }

        const def = this.getPathDefinition(field)

        if (def.isTable && action === 'read') return true //prove only final fields
        if (!def.permissions) {
            console.error('!def.permissions getFieldPermission field2 ', this.name, field, action)
        }
        const fieldRoles = def.permissions[action] || []
        // const lappedRoles = [...fieldRoles, ...parentRoles]
        return fieldRoles.some(role => rolesWithEverybody.includes(role))

    }

    _getKeyDefinition(key: string): FieldDefinition {
        return {...this.shape[key]};
    }

    static mapValidators = (validators: (Validator | string | ValidatorFinder)[]) => validators.map((validator) => {
        if (typeof validator === 'string') { //is is a string i found the Validator constructor in the instances
            return ValidatorCreator.getInstance(validator).getValidatorWithParam(true);
        } else if (typeof validator === 'object') {//if is a object is because the only property is the instance validatorName and the value is the param to pass to getValidatorWithParam
            const name = Object.keys(validator)[0];
            const param = validator[name];
            return ValidatorCreator.getInstance(name).getValidatorWithParam(param);
        }

        return <Validator>validator;
    })

    applyDefinitionsDefaults(definition: UserFieldDefinition, key: string): FieldDefinition {
        const fieldDefinition = <FieldDefinition>{};

        //insert  type Validator on top
        fieldDefinition.validators = Schema.mapValidators(definition.validators || [])
        const isNumberValidator = isNumber.getValidatorWithParam();
        const isDateValidator = isDate.getValidatorWithParam();
        const isIntegerValidator = isInteger.getValidatorWithParam();
        const isStringValidator = isString.getValidatorWithParam();
        // const isRequired = required.getValidatorWithParam();

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

        // if (Array.isArray(definition.type) && typeof definition.type[0] !== 'string' && (!hasValidator(fieldDefinition.validators, isRequired.validatorName))) {
        //     fieldDefinition.validators.unshift(isRequired);
        // }

        // set default -> default values
        fieldDefinition.isArray = false
        fieldDefinition.isTable = false
        if (Array.isArray(definition.type)) {
            fieldDefinition.isArray = true
            if (typeof definition.type[0] === 'string') {
                fieldDefinition.isTable = true
                fieldDefinition.type = definition.type[0]
                fieldDefinition.defaultValue = definition.defaultValue || [];
                fieldDefinition.validators.forEach(({tableValidator, arrayValidator, validatorName}) => {
                    if (!tableValidator && !arrayValidator) {
                        throw new Error(`Field "${key}" in schema "${this.name}" only accept validator of type Table or Array and has validator "${validatorName}"`)
                    }
                })
            } else {
                fieldDefinition.type = definition.type[0] as Native
                fieldDefinition.defaultValue = definition.defaultValue || null;
                fieldDefinition.validators.forEach(({tableValidator, validatorName}) => {
                    if (tableValidator) {
                        throw new Error(`Field "${key}" in schema "${this.name}" only accept validator of type array or scalar and has validator "${validatorName}"`)
                    }
                })
            }

        } else if ((typeof definition.type === 'string')) {
            fieldDefinition.isTable = true
            fieldDefinition.type = definition.type as string
            fieldDefinition.defaultValue = definition.defaultValue || {};
            fieldDefinition.validators.forEach(({tableValidator, validatorName}) => {
                if (!tableValidator) {
                    throw new Error(`Field "${key}" in schema "${this.name}" only accept validator of type Table and has validator "${validatorName}"`)
                }
            })
        } else {
            fieldDefinition.type = definition.type
            fieldDefinition.defaultValue = definition.defaultValue === 0 ? 0 : definition.defaultValue || null;

            fieldDefinition.validators.forEach(({tableValidator, arrayValidator, validatorName}) => {
                if (tableValidator || arrayValidator) {
                    throw new Error(`Field "${key}" in schema "${this.name}" only accept validator of type scalar and has validator "${validatorName}"`)
                }
            })
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
            fieldDefinition.label = inflection.transform(key, ['underscore', 'humanize', 'titleize'])
        }
        return fieldDefinition;
    }

    validateQuery = (fields: any, roles: string[]) => {
        for (const field of fields) {
            if (!this.getFieldPermission(field, 'read', roles)) {
                console.error(this.name, this.getPathDefinition(field))
                throw new Error(`401, You are not allowed to read "${field}" on ${this.name}`)
            }
        }
    }
    validateConnection = (roles: string[]) => {
        //TODO : think what to do with this
        return true
        if (!this.getSchemaPermission(roles, 'read')) {
            throw new Error(`401, You are not allowed to read on ${this.name}`)
        }
    }

    validateMutation = (action: Action, mutation: any, roles?: string[]) => {
        if (!Array.isArray(mutation)) mutation = [mutation]
        for (const m of mutation) {
            let data: any = m.data || m.create
            if (!data) continue
            const fields = Object.keys(data)
            for (const field of fields) {
                const def = this.getPathDefinition(field)
                const inline = !!(def.table && def.table.relation && def.table.relation.link === 'INLINE')

                if (def.isTable) {
                    const schema = Schema.getInstance(def.type)
                    const operations = Object.keys(data[field])
                    for (const operation of operations) {

                        if (operation === 'set' || operation === 'connect') {
                            const allowed = schema.getFieldPermission('id', action, roles)
                            if (!allowed) throw new Error(`401, You are not allowed to ${operation} "${field}.id" on ${this.name}`)
                            continue
                        }
                        let args2 = data[field][operation]
                        if (!Array.isArray(args2)) args2 = [args2]
                        if (operation !== 'upsert') {
                            for (let arg2 of args2) {
                                if (inline || operation !== 'update') arg2 = {data: arg2}
                                schema.validateMutation(action, arg2, roles)
                            }
                        } else {
                            for (let arg2 of args2) {
                                schema.validateMutation('update', {data: arg2.update}, roles)
                                schema.validateMutation('create', {data: arg2.create}, roles)
                            }
                        }
                    }
                } else {
                    const allowed = this.getFieldPermission(field, action, roles)
                    if (!allowed) throw new Error(`401, You are not allowed to ${action} "${field}" on ${this.name}.`)
                }
            }

        }
    }

    /**
     * Mutate the model,with all keys  proper types and null for undefined
     * @param model
     * @param fields
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
            const definition = this.getPathDefinition(key);

            if (!definition.isTable && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = forceType(model[key], definition.type);
                model[key] = model[key] === undefined || model[key] === null ? definition.defaultValue : model[key]

            } else if (definition.isTable && !definition.isArray && typeof model === 'object' && model !== undefined && model !== null) {
                if (model[key] === null || model[key] === undefined) {
                    model[key] = definition.defaultValue;
                }
                const schema = Schema.getInstance(definition.type)
                schema._clean(model[key], getDecendentsDot(fields, key));
                return;

            } else if (definition.isArray && typeof model === 'object' && model !== undefined && model !== null) {


                model[key] = forceType(model[key], Array)
                if (definition.isTable) {
                    const schema = Schema.getInstance(definition.type)
                    model[key] = model[key] && model[key].map((value: any) => {
                        schema._clean(value, getDecendentsDot(fields, key))
                        return value
                    });
                } else {
                    model[key] = model[key] && model[key].map((value: any) => forceType(value, definition.type));
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

    private _getPathDefinition(field: string, overwrite?: OverwriteDefinition): FieldDefinition {
        if (!this.pathDefinitions[field]) {
            this.pathDefinitions[field] = this.generatePathDefinition(field);
        }
        if (overwrite && overwrite.validators) {
            overwrite.validators = Schema.mapValidators(overwrite.validators)
        }
        return overwrite ? merge(cloneDeep(this.pathDefinitions[field]), overwrite) : this.pathDefinitions[field]

    }

    getChainedLabel(key: string) {
        const paths = key.split('.')
        let schema: Schema = this;
        const labels: string[] = []
        let def: FieldDefinition = schema._getKeyDefinition(paths[0])
        paths.forEach((path) => {
            if (!path.match(/\$|^\d+$/)) { //example user.0
                def = schema._getKeyDefinition(path)
                if (def.isTable) {
                    schema = Schema.getInstance(def.type)
                }
                if (def.label) {
                    labels.push(def.label)
                }
            } else {
                labels.push(`(${path})`)
            }
        });
        return labels.join(' -> ')
    }

    private generatePathDefinition(key: string): FieldDefinition {

        const paths = key.split('.')
        let schema: Schema = this;

        let def: FieldDefinition = schema._getKeyDefinition(paths[0])

        paths.forEach((path) => {
            if (!path.match(/\$|^\d+$/)) { //example user.0
                def = schema._getKeyDefinition(path)
                if (def.isTable) {
                    schema = Schema.getInstance(def.type)
                }
            }
        });

        return def
    }


    private _validate(model: Model, fields?: string[], overwrite?: Overwrite): ErrorValidator[] {
        let errors: ErrorValidator[] = [];
        const flatModel = flatten(model)
        const flatModelKeys = insertParents(Object.keys(flatModel))
        console.log('flatModelKeys', flatModelKeys)
        flatModelKeys.forEach(key => {
            const value = get(model, key)
            const cleanKey = Schema.cleanKey(key)
            if (fields && !fields.includes(cleanKey)) return
            const last = cleanKey.split('.').pop() as string
            const definition = this.getPathDefinition(cleanKey, overwrite && overwrite[cleanKey]);
            if (key === 'questions.0.correct.0') {
                console.log('key', key)
                console.log('cleanKey', cleanKey)
                console.log('value', value)
                console.log('definition', definition)
                console.log('isScalar', definition)
            }

            for (const validator of definition.validators) {
                const isScalar = key.match(/\.\d+$/)
                if (
                    definition.isTable && validator.tableValidator &&
                    isScalar //if is a scalar like user.0
                ) {
                    continue
                }
                if (
                    definition.isTable && !validator.tableValidator
                ) {

                    continue
                }

                if (
                    definition.isArray && validator.tableValidator
                ) {

                    continue
                }
                if (
                    definition.isArray &&
                    !validator.arrayValidator && !isScalar
                ) {

                    continue
                }
                if (
                    definition.isArray &&
                    validator.arrayValidator &&
                    isScalar  //if is a scalar like user.0
                ) {
                    continue
                }

                const instance = new validator({key: last, path: key, definition, value});
                const error = instance.validate(model);

                if (error) {
                    errors.push(error);
                }


            }
        })
        return errors;
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


export interface SchemaOptions {
    name: string
    errorFromServerMapper?: ErrorFromServerMapper
    permissions?: Permissions
}

export interface SchemaShape {
    [key: string]: FieldDefinition
}

export interface UserSchemaShape {
    [fieldName: string]: UserFieldDefinition
}

export type Native = (props: any) => any // String | Number | Date

export type Types = Native | string | Array<string> | Array<Native>

type Where = any

export type FilterMethod = (filter: any) => Where

export type FilterComponent = ((props: any) => ReactElement) | null


export interface CellComponentProps {
    columnIndex: number
    rowIndex: number
    data: any[]
    field: string

    [rest: string]: any
}

export type CellComponent = React.ComponentType<CellComponentProps & any> //React.ComponentClass<CellComponentProps> | React.ComponentType<CellComponentProps> | React.FunctionComponent<CellComponentProps> | ReactNode

export interface UserFieldDefinitionCommon {
    label?: LabelOrResolver
    description?: string
    validators?: Array<Validator | string | ValidatorFinder>
    defaultValue?: any
    transformValue?: (value: any) => any
    form?: {
        component?: React.Component
        props?: {
            placeholder?: string
            col?: false | number | any
            initialCount?: number
            transform?: (value: any) => any
            [rest: string]: any
        }
    }
    list?: {
        hidden?: boolean
        filterMethod?: FilterMethod
        filterComponent?: FilterComponent
        CellComponent?: CellComponent
        loadingElement?: ReactElement
        noFilter?: boolean
        width?: number | string
        props?: any
        noSort?: boolean

    }
    table?: {
        default?: any
        rename?: string
        unique?: boolean,
        createdAt?: boolean,
        updatedAt?: boolean,
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
        component?: React.Component
        props?: {
            placeholder?: string
            col?: false | number | any
            initialCount?: number
            transform?: (value: any) => any
            [rest: string]: any
        }
    }
    list: {
        hidden?: boolean
        filterMethod?: FilterMethod
        filterComponent?: FilterComponent
        CellComponent?: CellComponent
        loadingElement?: ReactElement
        noFilter?: boolean
        width?: number | string
        props?: any
        noSort?: boolean
    }
    table: {
        default?: any
        rename?: string
        unique?: boolean,
        createdAt?: boolean,
        updatedAt?: boolean,
        relation?: string | {
            link?: 'INLINE' | 'TABLE'
            name?: string
            onDelete?: 'SET_NULL' | 'CASCADE'
        }
        scalarList?: { strategy: "RELATION" | "EMBEDDED" }
    },
    permissions: Permissions
}

export interface Overwrite {
    [fields: string]: OverwriteDefinition
}

export interface OverwriteDefinition {
    type?: Native | string | Array<string> | Array<Native>,
    label?: Label
    description?: string
    validators?: Array<Validator | string | ValidatorFinder>
    defaultValue?: (value: any) => any
    form?: {
        initialCount?: number
        transform?: (value: any) => any
        component?: React.Component
        placeholder?: string
        col?: false | number | any
        props?: any
    }
    list?: {
        hidden?: boolean
        filterMethod?: FilterMethod
        filterComponent?: FilterComponent
        CellComponent?: CellComponent
        loadingElement?: ReactElement
        noFilter?: boolean
        width?: number | string
        props?: any
        noSort?: boolean
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
    orderBy: string,
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

export type Permission = ('everybody' | 'nobody' | string)[]

export interface Permissions {
    read?: Permission
    create?: Permission
    update?: Permission
    delete?: Permission
}


export type Action = keyof Permissions

