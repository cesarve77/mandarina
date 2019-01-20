import BaseError from './BaseError';

export class MissingIdTableError extends BaseError {
	constructor(schemaName: string) {
		super(`The table "${schemaName}" has missing required "id" field `);
	}
}