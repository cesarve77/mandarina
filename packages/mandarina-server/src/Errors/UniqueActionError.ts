import BaseError from 'mandarina/build/Errors/BaseError';
import {Schema} from "mandarina";

export class UniqueActionError extends BaseError {
	constructor(schemaName: string | Schema) {
		const name = typeof schemaName === "string" ? schemaName : schemaName.name
		super(`The action "${name}" already exists, action name should be unique.`);
	}
}
