import {Schema} from "mandarina";
import {FieldDefinition, Native, Overwrite, OverwriteDefinition} from "mandarina/build/Schema/Schema";
import {Validator} from "mandarina/build/Schema/ValidatorCreator";
import * as React from "react";
import {merge} from "lodash";
import {deepClone} from "mandarina/build/Operations/Mutate";
import {getDecendentsDot} from "mandarina/build/utils";

export interface ErrorInterface {
    [field: string]: string
}

export interface FieldProps {
    label: string
    allowedValues?: any[] | undefined
    transform?: (value: any) => any
    component?: React.Component;
    required: boolean
    placeholder?: string
    minCount?: number
    maxCount?: number
}

export class Bridge {
    protected fields: string[]
    protected schema: Schema
    protected overwrite?: Overwrite
    protected fieldDefinitions: { [field: string]: FieldDefinition } = {}
    protected fieldProps: { [field: string]: FieldProps } = {}

    constructor(schema: Schema, fields: string[], overwrite?: Overwrite) {
        if (!schema) throw new Error('Param "schema" missing creating a new Bridge')
        if (!fields) throw new Error('Param "fields" missing creating a new Bridge')
        this.fields = fields
        this.schema = schema
        this.overwrite = overwrite
    }

    static check(schema: any) {
        return schema instanceof Schema
    }


    // Field's scoped error.
    getError(name: string, error: ErrorInterface): true | string | undefined {
        if (error && typeof error.message === 'string' && this.schema.errorFromServerMapper) {
            return this.schema.errorFromServerMapper(name, error)
        }
        if (error && Object.keys(error).some(e => e.match(new RegExp(`^${name}\\.`)))) return true
        return error && error[name];
    }

    getErrorMessage(name: string, error: ErrorInterface): string | undefined {
        if (error && typeof error.message === 'string' && this.schema.errorFromServerMapper) {
            return this.schema.errorFromServerMapper(name, error)
        }
        return error && error[name];
    }

    getAncestors = (field: string): string[] => {
        const lastDot = field.lastIndexOf('.')
        if (lastDot >= 0) {
            const parent = field.substring(0, lastDot)
            return [...this.getAncestors(parent), parent]
        }
        return []
    }

    // All error messages from error.
    getErrorMessages(error: ErrorInterface): string[] {
        //for errors coming from server
        if (error && typeof error.message === 'string') {
            //todo checck cuando las porpiedades que sobran
            if (this.schema.errorFromServerMapper) {
                const errors: string[] = []
                this.fields.forEach((field) => {
                    const serverError = this.schema.errorFromServerMapper && this.schema.errorFromServerMapper(field, error)
                    if (serverError) errors.push(serverError)
                })
                if (errors.length) return errors
            }
            return [error.message.replace('GraphQL error:', '')]
        }
        //for errors generates here
        if (error) {
            return Object.keys(error).map(field => error[field])
        }
        return []

    }

    // Field's definition (`field` prop).
    getField(name: string): FieldDefinition {
        const field=Schema.cleanKey(name)
        const overwrite = this.overwrite && this.overwrite[field]
        if (!this.fieldDefinitions[field]) this.fieldDefinitions[field] = overwrite ? merge(deepClone(this.schema.getPathDefinition(field)), overwrite) : this.schema.getPathDefinition(field)
        if (!this.fieldDefinitions[field] || !this.fieldDefinitions[field].type) throw new Error(`No field named "${field}" in schema ${this.schema.name}`)
        return this.fieldDefinitions[field]
    }

    getType(name: string): Native {
        const def = this.getField(name);
        if (name.match(/\.(\d|\$)+$/)) {
            if (def.isTable) return Object
        } else {
            if (def.isArray) return Array
            if (def.isTable) return Object
        }
        return def.type
    }


    // Field's initial value.
    getInitialValue(name: string, props: object = {}) {
        const field = this.getField(name);
        const type = this.getType(name);
        if (type === Array && typeof field.type === 'string') {
            const validators: Validator[] = field.validators
            let minCount = 0
            const initialCount = field.form && field.form.props && field.form.props.initialCount || 0

            validators.forEach((validator) => {
                if (validator.validatorName === 'minCount') minCount = validator.param
            })

            const item = {}
            const schema = Schema.getInstance(field.type)
            schema.clean(item, getDecendentsDot(this.fields, name))
            const items = Math.max(minCount, initialCount)
            return new Array(items).fill(item)
        }
        if (type === Array) {
            const validators: Validator[] = field.validators
            let minCount = 0
            const initialCount = field.form && field.form.props && field.form.props.initialCount || 0
            validators.forEach((validator) => {
                if (validator.validatorName === 'minCount') minCount = validator.param
            })
            const item = field.defaultValue
            const items = Math.max(minCount, initialCount)
            return new Array(items).fill(item)
        } else if (type === Object) {
            let item = {}
            if (field.isTable) {
                const schema = Schema.getInstance(field.type)
                schema.clean(item, getDecendentsDot(this.fields, name))
            }
            return item
        }

        return field.defaultValue;
    }

    getSubfields(name: string) {
        if (!name) {
            return this.schema.keys
        }
        const field = this.getField(name)
        // if (field.isTable && name.match(/\.\d+$/)) {
        if (field.isTable) {
            const schema = Schema.getInstance(field.type)
            return schema.keys
        } else {
            return []
        }
    }

    findValidator(validatorName: string, field: string | FieldDefinition | OverwriteDefinition): undefined | Validator {
        let def: FieldDefinition | OverwriteDefinition
        let validators: Validator[] = []
        if (typeof field === 'string') {
            def = this.getField(field)
        } else {
            def = field
        }

        if (def.validators && def.validators.some(v => typeof v === 'string')) {
            validators = Schema.mapValidators(def.validators)
        } else {
            validators = (def.validators || []) as Validator[]
        }

        for (const validator of validators) {
            if (validator.validatorName === validatorName) return validator
        }
        return
    }

    // Field's props.
    getProps(name: string, props: { placeholder?: boolean | null } = {}): FieldProps {
        if (!this.fieldProps[name]) {
            const field = this.getField(name)
            const transform = field.form && field.form.props && field.form.props.transform
            const validatorIsAllowed = this.findValidator('isAllowed', field)
            let allowedValues: any[] | undefined = undefined
            if (validatorIsAllowed) allowedValues = validatorIsAllowed.param
            const cleanName=Schema.cleanKey(name)
            const required = !!(this.findValidator('required', field) || this.findValidator('noEmpty', field)
                || (this.overwrite &&  this.overwrite[cleanName] && !!this.findValidator('required', this.overwrite[cleanName])))

            let uniforms = field.form, component = field.form.component
            let placeholder = field.form && field.form.props && field.form.props.placeholder
            if (props.placeholder === false || props.placeholder === null) {
                placeholder = '';
            }
            let minCount = 0
            let maxCount = 9999
            field.validators.forEach((validator) => {
                if (validator.validatorName === 'minCount') minCount = validator.param
                if (validator.validatorName === 'maxCount') maxCount = validator.param
            })


            this.fieldProps[name] = {
                label: field.label ? field.label : "",
                allowedValues,
                minCount,
                maxCount,
                transform,
                component,
                required,
                placeholder,
                ...uniforms,
                ...field.form.props,

            }
        }
        return this.fieldProps[name]
        /**
         min?: number | Date;
         max?: number | Date;
         exclusiveMin?: boolean;
         exclusiveMax?: boolean;
         minCount?: number;
         maxCount?: number;
         optional?: boolean;
         allowedValues?: any[];
         regEx?: RegExp;
         blackbox?: boolean;
         trim?: boolean;
         custom?: Function;
         autoValue?: Function;
         */

    }


// Function with one argument - model - which throws errors when model is
// invalid.
    getValidator(): (model: any) => void {
        return (model: any) => {
            let enter = false
            const errors = this.schema.validate(model, this.fields, this.overwrite)
            if (errors.length) {
                const error = {}
                errors.forEach((e) => {
                    if (this.fields.includes(Schema.cleanKey(e.path))) {
                        enter = true
                        error[e.path] = e.message
                    }
                })
                if (enter) throw {...error}

            }
        }
    }
}

