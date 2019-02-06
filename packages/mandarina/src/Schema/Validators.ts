import {ValidatorCreator} from "./ValidatorCreator";

const exists = (value: any) => value === 0 || value

export const required = new ValidatorCreator(exists, 'required', '{{label}} is required')

export const maxNumber = new ValidatorCreator((value, param) => value <= param, 'maxNumber', '{{label}} cannot exceed {{param}}')

export const maxNumberExclusive = new ValidatorCreator((value, param) => value < param, 'maxNumberExclusive', '{{label}} must be less than {{param}}')

export const minNumber = new ValidatorCreator((value, param) => value >= param, 'minNumber', '{{label}} must be at least {{param}}')

export const minNumberExclusive = new ValidatorCreator((value, param) => value > param, 'minNumberExclusive', '{{label}} must be greater than {{param}}')

export const extraKey = new ValidatorCreator((value, param = true) => !param, 'extraKey', 'Extra key {{value}} found at {{label}}')

export const minString = new ValidatorCreator((value, param = true) => value.length >= param, 'minString', '{{label}} must be at least {{param}} characters')

export const maxString = new ValidatorCreator((value, param = true) => value.length <= param, 'maxString', '{{label}} cannot exceed {{param}} characters')

export const minDate = new ValidatorCreator((value, param = true) => value.getTime() <= param.getTime(), 'minDate', '{{label}} must be on or after {{param}}')

export const maxDate = new ValidatorCreator((value, param = true) => value.getTime() >= param.getTime(), 'maxDate', '{{label}} cannot be after {{param}}')

export const minCount = new ValidatorCreator((value, param) => Array.isArray(value) && value.length >= param, 'minCount', '{{label}} must specify at least {{param}} values', true)

export const maxCount = new ValidatorCreator((value, param) => Array.isArray(value) && value.length <= param, 'maxCount', '{{label}} cannot specify more than {{param}} values', true)

export const isAllowed = new ValidatorCreator((value, param) => !exists(value) || param.includes(value), 'isAllowed', '{{label}} has not an allowed value "{{value}}"')

export const isNumber = new ValidatorCreator((value) => !exists(value) || typeof value === 'number', 'isNumber', '{{label}} must be an integer')

export const isInteger = new ValidatorCreator((value) => !exists(value) || typeof value === 'number' && value % 1 === 0, 'isInteger', '{{label}} must be an integer')

export const isString = new ValidatorCreator((value) => !exists(value) || typeof value === 'string', 'isString', '{{label}} must be an string')

export const isDate = new ValidatorCreator((value) => !exists(value) || value instanceof Date, 'isDate', '{{label}} is not a valid date')

export const isArray = new ValidatorCreator((value) => !exists(value) || Array.isArray(value), 'isArray', "{{label}} should be a array", true)

export const isRegEx = new ValidatorCreator((value, param: RegExp) => !exists(value) || param.test(value), 'isRegEx', "{{label}} has an invalid format")

export const isEmail = new ValidatorCreator((value) => !exists(value) || /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value), 'isEmail', "{{label}} has an invalid format")




