import BaseError from 'mandarina/build/Errors/BaseError';

export class UniqueTableError extends BaseError {
	constructor(schemaName: string) {
		super(`The table "${schemaName}" already exists, table name should be unique`);
	}
}
