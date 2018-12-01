import {Table} from "mandarina";
import {FieldDefinition, Native, Schema} from "mandarina/build/Schema/Schema";
import {Validator} from "mandarina/build/Schema/ValidatorCreator";

export interface ErrorInterface {
    [field: string]: string
}
export interface FieldProps{
    label: string
    allowedValues?: any[] | undefined
    transform:(value: any) => any
    component: JSX.ElementClass
    required: boolean
    placeholder?: string
    minCount?: number
    maxCount?: number
}
export class Bridge {
    protected schema: Schema
    protected fields: { [field: string]: FieldDefinition }={}
    protected fieldProps: { [field: string]: FieldProps }={}

    constructor(schemaOrTable: Schema | Table) {
        this.schema = schemaOrTable instanceof Schema ? schemaOrTable : schemaOrTable.schema
    }

    static check(schema: any) {
        return schema instanceof Schema
    }


    // Field's scoped error.
    getError(name: string, error: ErrorInterface): string | undefined {
        if (error && typeof error.message === 'string' && this.schema.errorFromServerMapper) {
            return this.schema.errorFromServerMapper(name, error)
        }
        return error && error[name];
    }

    getErrorMessage(name: string, error: ErrorInterface): string | undefined {
        if (error && typeof error.message === 'string' && this.schema.errorFromServerMapper) {
            return this.schema.errorFromServerMapper(name, error)
        }
        return error && error[name];
    }


    // All error messages from error.
    getErrorMessages(error: ErrorInterface): string[] {
        //for errors coming from server
        if (error && typeof error.message === 'string') {
            //todo checck cuando las porpiedades que sobran
            if (this.schema.errorFromServerMapper) {
                const errors: string[] = []
                this.schema.getFields().forEach((field) => {
                    const serverError = this.schema.errorFromServerMapper && this.schema.errorFromServerMapper(field, error)
                    if (serverError) errors.push(serverError)
                })
                if (errors.length) return errors
            }
            return [error.message.replace('GraphQL error:', '')]
        }
        //for errors generates here
        return error
            ? Object.keys(error).map(field => error[field])
            : [];
    }

    // Field's definition (`field` prop).
    getField(name: string): FieldDefinition {
        if (!this.fields[name]) this.fields[name] = this.schema.getPathDefinition(name);
        if (!this.fields[name] || !this.fields[name].type) throw new Error(`No field named "${name}" in table ${this.schema.name}`)
        return this.fields[name]
    }

    getType(name: string): string | string[] | Native | Native[] {
        const type = this.getField(name).type;
        if (Array.isArray(type)) return Array
        if (typeof type === 'string') return Object
        return type
    }

    // Field's initial value.
    getInitialValue(name: string, props: object = {}) {
        const field = this.getField(name);
        const type = this.getType(name);
        if (type === Array) {


            const validators: Validator[] = field.validators
            let minCount = 0
            const initialCount = field.form.initialCount || 0
            validators.forEach((validator) => {
                if (validator.validatorName === 'minCount') minCount = validator.param
            })
            let item = {}
            if (type === Object) {
                const table = field.type[0]
                if (typeof field.type[0] === 'string') {
                    const schema = Schema.getInstance(table)
                    schema.clean(item)
                }
            } else {
                item = field.defaultValue
            }
            const items = Math.max(minCount, initialCount)
            return new Array(items).fill(item)
        } else if (type === Object) {
            let item = {}
            const table = field.type
            if (typeof table === 'string') {
                const schema = Schema.getInstance(table)
                schema.clean(item)
            }
            return item
        }
        return field.defaultValue;
    }

    getSubfields(name: string) {
        if (!name) return this.schema.keys
        const field = this.getField(name)
        if (typeof field.type === 'string') {
            const schema = Schema.getInstance(field.type)
            return schema.keys
        } else {
            return []
        }


    }

    findValidator(validatorName: string, field: string | FieldDefinition): undefined | Validator {
        let def: FieldDefinition
        if (typeof field === 'string') {
            def = this.getField(field)
        } else {
            def = field
        }
        for (const validator of def.validators) {
            if (validator.validatorName === validatorName) return validator
        }
        return
    }

    // Field's props.
    getProps(name: string, props: { placeholder?: boolean | null } = {}): FieldProps {
        if (!this.fieldProps[name]) {
            const field = this.getField(name)
            const transform = field.form.transform
            const validatorIsAllowed = this.findValidator('isAllowed', field)
            let allowedValues: any[] | undefined = undefined
            if (validatorIsAllowed) allowedValues = validatorIsAllowed.param
            const required = !!this.findValidator('required', field)

            let uniforms = field.form, component=field.form.component
            if (typeof uniforms === 'string' || typeof uniforms === 'function') {
                component = uniforms
                uniforms={}

            }

            let placeholder

            if (props.placeholder === true && uniforms.placeholder) {
                placeholder = uniforms.placeholder;
            } else if (props.placeholder === false || props.placeholder === null) {
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
    getValidator(options: any): (model: any) => void {
        return (model: any) => {
            const errors = this.schema.validate(model)
            if (errors.length) {
                const error = {}
                errors.forEach((e) => {
                    error[e.path] = e.message
                })
                throw {...error}
            }
        }
    }
}

