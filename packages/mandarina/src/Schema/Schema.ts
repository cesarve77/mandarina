// @ts-ignore
import {mapValues} from 'lodash';
import * as inflection from "inflection";

import {ErrorValidator, Validator, ValidatorCreator} from "./ValidatorCreator";
import {extraKey, isDate, isInteger, isNumber, isString, required} from "./Validators";
import {forceType, hasValidator} from "./utils";
import {Permissions} from "../Table/Table";
import {UniqueSchemaError} from '../Errors/UniqueSchemaError';
import {SchemaInstanceNotFound} from '../Errors/SchemaInstanceNotFound';
import {capitalize, pluralize, singularize} from "../Table/utils";

export class Schema {

    static instances: Schema[]
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

    constructor(shape: UserSchemaShape, options: SchemaOptions) {
        const {name, recursive = [], forceType = true, virtual = false, errorFromServerMapper, permissions} = options;
        this.name = name;

        Schema.instances = Schema.instances || [];

        if (Schema.instances[this.name]) {
            throw new UniqueSchemaError(this.name);
        }

        Schema.instances[this.name] = this;
        this.errorFromServerMapper = errorFromServerMapper;
        this.options = {recursive, forceType, virtual};
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

    applyDefinitionsDefaults(definition: UserFieldDefinition, key: string): FieldDefinition {
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
            definition.validators.unshift(isNumberValidator);
        }

        if (definition.type === Date && (!hasValidator(fieldDefinition.validators, isDateValidator.validatorName))) {
            definition.validators.unshift(isDateValidator);
        }

        if (definition.type === Integer && (!hasValidator(fieldDefinition.validators, isIntegerValidator.validatorName))) {
            definition.validators.unshift(isIntegerValidator);
        }

        if (definition.type === String && (!hasValidator(fieldDefinition.validators, isStringValidator.validatorName))) {
            definition.validators.unshift(isStringValidator);
        }

        if (Array.isArray(definition.type) && typeof definition.type[0] !== 'string' && (!hasValidator(fieldDefinition.validators, isRequired.validatorName))) {
            definition.validators.unshift(isRequired);
        }

        // set default -> default values
        if (Array.isArray(definition.type)) {
            if (typeof definition.type[0] === 'string') {
                fieldDefinition.defaultValue = definition.defaultValue || {};
            } else {
                fieldDefinition.defaultValue = definition.defaultValue || null;
            }

        } else if (typeof definition.type === 'string') {
            fieldDefinition.defaultValue = definition.defaultValue || {};
        } else {
            fieldDefinition.defaultValue = definition.defaultValue === 0 ? 0 : definition.defaultValue || null;
        }

        fieldDefinition.type = definition.type;
        definition.permissions = definition.permissions || this.permissions;
        fieldDefinition.permissions = definition.permissions;
        fieldDefinition.permissions.read = fieldDefinition.permissions.read || this.permissions.read;
        fieldDefinition.permissions.create = fieldDefinition.permissions.create || this.permissions.create;
        fieldDefinition.permissions.update = fieldDefinition.permissions.update || this.permissions.update;
        fieldDefinition.permissions.delete = fieldDefinition.permissions.delete || this.permissions.delete;
        fieldDefinition.type = definition.type;
        fieldDefinition.form = definition.form || {};
        fieldDefinition.list = definition.list || {};
        fieldDefinition.unique = !!definition.unique;
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

    /**
     *
     * @param permissions
     */
    inheritPermission(permissions?: Permissions) {
        return this
        // TODO: this is has very bad performance for deep nested tables
        // if (!permissions) {
        //     return this
        // }

        // const clone: Schema = cloneDeep(this);
        // clone.permissions = permissions;
        // clone.shape = mapValues(clone.shape, (def, key) => clone.applyDefinitionsDefaults(def, key));

        // clone.keys = Object.keys(clone.shape);
        // return clone;
    }

    getPathDefinition(key: string): FieldDefinition {
        if (!this.pathDefinitions[key]) {
            this.pathDefinitions[key] = this.generatePathDefinition(key);
        }

        return this.pathDefinitions[key];
    }

    validate(model: Model): ErrorValidator[] {
        return this._validate(model, '', [{schema: this.name, path: ''}], model);
    }

    getFields(): string[] {
        if (!this.fields) {
            this.fields = this._getFields();
        }

        return this.fields;
    }

    clean(model: Model, transform: boolean = false) {
        this.original = model;
        this._clean(model, transform);
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

    /**
     * Mutate the model,with all keys  proper types and null for undefined
     * TODO: Refactor to prevent mutation, fix it creating a new cloned model and returning it
     * @param model
     * @param transform
     * @param removeExtraKeys
     */
    protected _clean(model: Model | undefined | null, transform = false, removeExtraKeys = true) {
        if (removeExtraKeys && model && typeof model === 'object') {
            Object.keys(model).forEach((key) => {
                if (!this.keys.includes(key)) {
                    delete model[key]
                }
            });
        }

        this.keys.forEach((key): any => {
            const definition = this.getFieldDefinition(key);
            const type = definition.type;

            if (typeof type === "function" && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = forceType(model[key], <Native>definition.type);
                model[key] = model[key] === 0 ? 0 : model[key] || definition.defaultValue;

            } else if (typeof type === "string" && typeof model === 'object' && model !== undefined && model !== null) {
                if (model[key] !== 0 && !model[key]) {
                    return model[key] = definition.defaultValue;
                }

                const schema = Schema.getInstance(type);
                schema._clean(model[key], transform);
                return;

            } else if (Array.isArray(type) && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = forceType(model[key], Array)

                if (typeof type[0] === 'string') {
                    const schema = Schema.getInstance(<string>type[0]);
                    model[key] = model[key].map((value: any) => {
                        schema._clean(value, transform)
                        return value
                    });
                } else {
                    model[key] = model[key].map((value: any) => forceType(value, <Native>type[0]));
                }
                return;
            } else if (Array.isArray(type) && typeof model !== 'object' && model !== undefined && model !== null) {
                console.log('NOOOOO DETERMINADO', key, model)

            }


            if (transform && model) {
                model[key] = definition.transformValue.call({
                    model: this.original,
                    siblings: model
                }, model[key]);
            }
        })
    }

    private generatePathDefinition(key: string): FieldDefinition {
        const paths = key.split('.')
        let schema: Schema = this;
        let def = schema.getFieldDefinition(paths[0]);

        paths.forEach((path) => {
            if (!path.match(/\$|^\d+$/)) { //example user.0
                def = schema.getFieldDefinition(path)

                if (typeof def.type === 'string') {
                    schema = Schema.getInstance(def.type).inheritPermission(def.permissions);
                }

                if (Array.isArray(def.type)) {
                    const tableName = def.type[0];

                    if (typeof tableName === 'string') {
                        schema = Schema.getInstance(tableName).inheritPermission(def.permissions);
                    }

                }
            } else if (Array.isArray(def.type)) { //should be
                def.type = def.type[0];
                if (typeof def.type === 'string') {
                    schema = Schema.getInstance(def.type).inheritPermission(def.permissions);
                }
            }
        });

        return def
    }

    private _validate(model: Model, parent: string = '', pathHistory: { schema: string, path: string }[] = [], originalModel: Model): ErrorValidator[] {

        let errors: ErrorValidator[] = [];
        const shape = {...model};

        this.keys.forEach((key): any => {

            delete shape[key];
            const dot = parent ? '.' : '';
            const path: string = `${parent}${dot}${key}`;
            const definition = this.getFieldDefinition(key);
            const value: any = model && model[key];
            const type = definition.type;

            if (typeof type === "string") {
                const schema = Schema.getInstance(type);
                const schemaName = schema.name;
                let internalErrors: ErrorValidator[] = [];

                // Check if we are entering in a recursive table, if actual table has been used before, reviewing the history
                if (!pathHistory.some(({schema, path}) => schemaName === schema)) {
                    internalErrors = schema._validate(value, path, pathHistory, originalModel);
                }
                pathHistory.push({path: path, schema: schemaName});

                return errors = [...errors, ...internalErrors];
            }


            if (Array.isArray(type)) {
                for (const validator of definition.validators) {
                    if (!validator.arrayValidator) continue
                    const instance = new validator({key, path, definition, value});
                    const error = instance.validate(originalModel);
                    if (error) {
                        return errors.push(error);
                    }
                }
                // TODO: Tal vez es mejor chequear en default value que siempre tenga un valor
                if (typeof type[0] === 'string' && value) {
                    const schema = Schema.getInstance(<string>type[0]);
                    const schemaName = schema.name;
                    let internalErrors: ErrorValidator[] = [];
                    value.forEach((value: any, i: number) => {
                        if (!pathHistory.some(({schema, path}) => schemaName === schema)) {
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

            if (typeof def.type === 'string') {
                table = Schema.getInstance(def.type);
            }

            if (Array.isArray(def.type)) {
                this.arraysFields.push(path);
                if (typeof def.type[0] === 'string') {
                    table = Schema.getInstance(<string>def.type[0]);
                }
            }

            if (table) {
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
    virtual: boolean
    forceType: boolean
    recursive?: string[]
}

export interface SchemaOptions {
    name: string
    virtual?: boolean
    forceType?: boolean
    filterExtraKeys?: boolean
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

export type CellComponent = (props: { columnIndex: number, rowIndex: number, data: any[], field: string }) => JSX.Element | null


export interface UserFieldDefinition {
    type: Types
    label?: LabelOrResolver
    description?: string
    validators?: Array<Validator | string | ValidatorFinder>
    defaultValue?: any
    transformValue?: (value: any) => any
    form?: any;
    list?: {
        hidden?: true
        filterMethod?: FilterMethod
        filterComponent?: FilterComponent
        CellComponent?: CellComponent
        loadingElement?: JSX.Element
        filter?: boolean
        width?: number

    }
    unique?: boolean
    permissions?: Permissions
}

export interface ValidatorFinder {
    [validator: string]: any
}

export interface FieldDefinition extends UserFieldDefinition{
    type: Native | string | Array<string> | Array<Native>,
    label: Label
    description?: string
    validators: Array<Validator>
    defaultValue: any
    transformValue: (value: any) => any
    form: any;
    list: {
        hidden?: true
        filterMethod?: FilterMethod
        filterComponent?: FilterComponent
        CellComponent?: CellComponent
        loadingElement?: JSX.Element
        filter?: boolean
        width?: number
    }
    unique: boolean
    permissions: Permissions
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
