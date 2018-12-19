import BaseError from './BaseError';

export class InvalidActionError extends BaseError {
	constructor(action: string) {
		super(`"${action}" is an invalid action`);
	}
}
