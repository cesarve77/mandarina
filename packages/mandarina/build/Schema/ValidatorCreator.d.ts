import { FieldDefinition } from "./Schema";
/**
 * Compile a template for the a error messages based on label, arguments, and template itself
 * @param label - Humanize type of field
 * @param template - error template message, like {{label}} is required!, for argumens the search pararm is like {{arg[0]}},  {{arg[1]}} ... etc
 * @param value - validated value
 * @param args - other params of the validatios
 */
export declare const compileMessage: ({ label, template, value, param }: {
    label: string;
    template: string;
    value?: any;
    param?: any;
}) => string;
export declare class ValidatorCreator {
    static instances: ValidatorCreator[];
    name: string | undefined;
    template: string;
    validation: Validation;
    arrayValidator: boolean;
    tableValidator: boolean;
    constructor(validation: Validation, name: string, template?: string, arrayValidator?: boolean, tableValidator?: boolean);
    static getInstance(name: string): ValidatorCreator;
    setTemplate(template: string): ValidatorCreator;
    /**
     * alias for getValidatorWithParam
     * @param param - limits of validation, for example for min is the min value
     */
    with(param?: any): Validator;
    /**
     * any param to limit the validator, for example min or max.
     * it return a function to receive ValidatorParams
     * @param param
     * @return {function}
     */
    getValidatorWithParam(param?: any): Validator;
}
export interface ValidatorInterface {
    key: string;
    label: string;
    value: any;
    path: string;
    validate(model?: object): undefined | ErrorValidator;
}
export interface Validator {
    validatorName: string | undefined;
    arrayValidator: boolean;
    tableValidator: boolean;
    param: any;
    new ({ key, definition, path, value }: ValidatorParams): ValidatorInterface;
}
export declare namespace ValidateFunction {
    let type: string;
}
export interface ValidatorParams {
    key: string;
    definition: Partial<FieldDefinition>;
    value?: any;
    path: string;
}
export interface ErrorValidator {
    key: string;
    label: string;
    message: string;
    value: any;
    validatorName: string | undefined;
    path: string;
}
export interface Validation {
    (this: {
        model: any;
    }, value: any, param: any): boolean;
}
