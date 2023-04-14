import BaseError from 'mandarina/build/Errors/BaseError';
import { Schema } from "mandarina";
export declare class UniqueActionError extends BaseError {
    constructor(schemaName: string | Schema);
}
