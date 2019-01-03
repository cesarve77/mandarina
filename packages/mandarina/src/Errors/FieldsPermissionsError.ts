import BaseError from './BaseError';

export class FieldsPermissionsError extends BaseError {
	constructor(action: string, invalidFields: string[]) {
		super(`You cannot execute the "${action}" action over these fields: ${invalidFields.join(', ')}`);
	}
}
