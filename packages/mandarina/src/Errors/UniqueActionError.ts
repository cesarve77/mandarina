import BaseError from './BaseError';

export class UniqueActionError extends BaseError {
	constructor(schemaName: string) {
		super(`The action "${schemaName}" already exists, action name should be unique`);
	}
}
