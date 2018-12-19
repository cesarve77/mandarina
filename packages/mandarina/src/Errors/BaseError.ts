export default class BaseError extends Error {
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, BaseError.prototype);
	}
}
