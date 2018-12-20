import BaseError from './BaseError';

export class UniqueSchemaError extends BaseError {
	constructor(schemaName: string) {
		super(`The schema "${schemaName}" already exists, schema name should be unique`);
	}
}
