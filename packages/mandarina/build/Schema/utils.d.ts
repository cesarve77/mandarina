import { FieldDefinition, Native } from "./Schema";
import { Validator } from "./ValidatorCreator";
export declare const forceType: (value: any, type: Native) => any;
export declare const isRequired: (field: FieldDefinition) => boolean;
export declare const hasValidator: (validators: Validator[], name?: string | undefined) => boolean;
export declare const get: (obj: any, paths: string[]) => any[];
/**
 * Upper case the first latter
 * @param  string - string to be upper cased
 */
export declare const capitalize: (string: string) => string;
/**
 * Lower case the first latter
 * @param  string - string to be Lower cased
 */
export declare const lowerize: (string: string) => string;
export declare const pluralize: (str: string) => string;
export declare const singularize: (str: string) => string;
