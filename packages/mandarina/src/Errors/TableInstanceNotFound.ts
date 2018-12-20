import BaseError from './BaseError';

export class TableInstanceNotFound extends BaseError {
	constructor(schemaName: string) {
		super(`The table ${schemaName} was not instantiated`);
	}
}
