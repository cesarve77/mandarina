import BaseError from './BaseError';
export declare class FieldsPermissionsError extends BaseError {
    constructor(action: string, invalidFields: string[]);
}
