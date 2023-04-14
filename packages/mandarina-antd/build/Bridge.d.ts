import { Schema } from "mandarina";
import { FieldDefinition, Native, Overwrite, OverwriteDefinition } from "mandarina/build/Schema/Schema";
import { Validator } from "mandarina/build/Schema/ValidatorCreator";
import * as React from "react";
export interface ErrorInterface {
    [field: string]: string;
}
export interface FieldProps {
    label: string;
    allowedValues?: any[] | undefined;
    transform?: (value: any) => any;
    component?: React.Component;
    required: boolean;
    placeholder?: string;
    minCount?: number;
    maxCount?: number;
}
export declare class Bridge {
    protected fields: string[];
    protected schema: Schema;
    protected overwrite?: Overwrite;
    protected fieldDefinitions: {
        [field: string]: FieldDefinition;
    };
    protected fieldProps: {
        [field: string]: FieldProps;
    };
    constructor(schema: Schema, fields: string[], overwrite?: Overwrite);
    static check(schema: any): boolean;
    getError(name: string, error: ErrorInterface): true | string | undefined;
    getErrorMessage(name: string, error: ErrorInterface): string | undefined;
    getAncestors: (field: string) => string[];
    getErrorMessages(error: ErrorInterface): string[];
    getField(name: string): FieldDefinition;
    getType(name: string): Native;
    getInitialValue(name: string, props?: object): any;
    getSubfields(name: string): string[];
    findValidator(validatorName: string, field: string | FieldDefinition | OverwriteDefinition): undefined | Validator;
    getProps(name: string, props?: {
        placeholder?: boolean | null;
    }): FieldProps;
    getValidator(): (model: any) => void;
}
