import BaseError from './BaseError';

export class SchemaInstanceNotFound extends BaseError {
	constructor(schemaName: string) {
		super(`The schema ${schemaName} was not instantiated`);
	}
}
