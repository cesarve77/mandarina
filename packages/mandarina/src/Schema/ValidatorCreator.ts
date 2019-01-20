import {FieldDefinition, Native} from "./Schema";
import {ErrorValidator, ValidatorParams} from "./ValidatorCreator";


/**
 * Compile a template for the a error messages based on label, arguments, and template itself
 * @param label - Humanize type of field
 * @param template - error template message, like {{label}} is required!, for argumens the search pararm is like {{arg[0]}},  {{arg[1]}} ... etc
 * @param value - validated value
 * @param args - other params of the validatios
 */
export const compileMessage = ({label, template, value, param}: { label: string, template: string, value?: any, param?: any }): string => {
    let message = template.replace(/\{\{label\}\}/gi, label)
    message = message.replace(/\{\{value\}\}/gi, value)
    message = message.replace(/\{\{param\}\}/gi, param)
    return message
}

export class ValidatorCreator {
    static instances: ValidatorCreator[];
    public name: string | undefined;
    public template: string;
    public validation: Validation;
    public arrayValidator: boolean;

    constructor(validation: Validation, name: string, template: string = '{{field}} is invalid.', arrayValidator: boolean = false) {
        this.validation = validation
        this.template = template
        this.name = name
        this.arrayValidator = arrayValidator
        ValidatorCreator.instances = ValidatorCreator.instances || {}
        if (ValidatorCreator.instances[name]) throw new Error(`Validator named ${name} already exists, names should be uniques`)
        ValidatorCreator.instances[name] = this
    }

    static getInstance(name: string): ValidatorCreator {
        const instance = ValidatorCreator.instances[name]
        if (!instance) throw new Error(`No Validator named ${name}`)
        return instance
    }


    setTemplate(template: string): ValidatorCreator {
        this.template = template
        return this
    }

    /**
     * alias for getValidatorWithParam
     * @param param - limits of validation, for example for min is the min value
     */
    with(param?: any): Validator {
        return this.getValidatorWithParam(param)
    }

    /**
     * any param to limit the validator, for example min or max.
     * it return a function to receive ValidatorParams
     * @param param
     * @return {function}
     */
    getValidatorWithParam(param?: any): Validator {
        const name = this.name
        const validation = this.validation
        const template = this.template
        const arrayValidator = this.arrayValidator
        const validator = class Validator implements ValidatorInterface {
            static param: any
            static arrayValidator: boolean = arrayValidator
            static validatorName: string | undefined = name
            key: string
            label: string
            type: string | Native | string[] | Native[]
            value: any
            definition: FieldDefinition
            path: string

            constructor({key, definition, path, value}: ValidatorParams) {
                this.key = key
                this.definition = definition
                this.label = definition.label ? definition.label : ""
                this.type = definition.type
                this.value = value

                this.path = path
            }


            validate(model?: object): undefined | ErrorValidator {
                const context = {model}
                if (!validation.call(context, this.value, Validator.param)) {
                    return {
                        key: this.key,
                        label: this.label,
                        message: compileMessage({label: this.label, template, param: Validator.param}),
                        value: this.value,
                        validatorName: name,
                        path: this.path,
                    }
                }
                return undefined
            }

        }
        validator.param = param
        validator.arrayValidator = arrayValidator
        return validator

    }


}

export interface ValidatorInterface {
    key: string
    label: string
    value: any
    path: string

    validate(model?: object): undefined | ErrorValidator
}

export interface Validator {
    validatorName: string | undefined
    arrayValidator: boolean
    param: any

    new({key, definition, path, value}: ValidatorParams): ValidatorInterface
}


export namespace ValidateFunction {
    export let type: string
}

export interface ValidatorParams {
    key: string,
    definition: FieldDefinition,
    value?: any,
    path: string,
}


export interface ErrorValidator {
    key: string,
    label: string,
    message: string,
    value: any,
    validatorName: string | undefined,
    path: string,
}


export interface Validation {
    (value: any, param: any): boolean
}

