import {FieldDefinition, Integer, Native} from "./Schema";
import {Validator} from "./ValidatorCreator";
import * as inflection from "inflection";


//code borrowed from https://github.com/aldeed/simple-schema-js/blob/master/package/lib/clean/convertToProperType.js
export const forceType = (value: any, type: Native): any => {
    if (
        Array.isArray(value) ||
        (value && (typeof value === 'function' || typeof value === 'object') && !(value instanceof Date)) ||
        value === null
    ) return value;

    // Convert to String type
    if (type === String) {
        if (value === null || value === undefined) return value;
        return value.toString();
    }

    // Convert to Number type
    if (type === Number || type === Integer) {
        if (typeof value === 'string' && value.length > 0) {
            // Try to convert numeric strings to numbers
            const numberVal = Number(value);
            if (!isNaN(numberVal)) return numberVal;
        }

        // Leave it; will fail validation
        return value;
    }

    // If target type is a Date we can safely convert from either a
    // number (Integer value representing the number of milliseconds
    // since 1 January 1970 00:00:00 UTC) or a string that can be parsed
    // by Date.
    if (type === Date) {
        if (typeof value === 'string') {
            const parsedDate = Date.parse(value);
            if (!isNaN(parsedDate)) return new Date(parsedDate);
        }
        if (typeof value === 'number') return new Date(value);
    }

    // Convert to Boolean type
    if (type === Boolean) {
        if (typeof value === 'string') {
            // Convert exact string 'true' and 'false' to true and false respectively
            if (value.toLowerCase() === 'true') return true;
            else if (value.toLowerCase() === 'false') return false;
        } else if (typeof value === 'number' && !isNaN(value)) { // NaN can be error, so skipping it
            return Boolean(value);
        }
    }

    // If an array is what you want, I'll give you an array
    if (type === Array) {
        if (value !== 0 && value) return [value];
        return []
    }

    // Could not convert
    return value;
}


export const isRequired = (field: FieldDefinition): boolean => hasValidator(field.validators, 'required') || hasValidator(field.validators, 'noEmpty')

export const hasValidator = (validators: Validator[], name?: string): boolean => {
    if (!name) return false
    const filtered = validators.filter(({validatorName}) => validatorName === name)
    return !!filtered.length
}


export const get = (obj: any = {}, paths: string[]): any[] => {

    const result: any[] = []
    const len = paths.length
    for (let i = 0; i < len; i++) {
        const path = paths[i]
        paths = paths.slice(i + 1)
        if (obj === null) {
            result.push(null)
            return result
        }
        const val = obj[path]

        if (Array.isArray(val)) {
            val.forEach((val) => {
                if (paths.length === 0) {
                    result.push(val)
                } else {
                    result.push(...get(val, paths))
                }

            })
        } else if (val === 0 || val === false || val) {
            if (paths.length === 0) {
                result.push(val)
                return result
            } else {
                result.push(...get(val, paths))
                return result
            }

        }
    }

    return result
}


/**
 * Upper case the first latter
 * @param  string - string to be upper cased
 */
export const capitalize = (string: string): string => {
    const result = string.trim()
    return result.charAt(0).toUpperCase() + result.slice(1)
}

/**
 * Lower case the first latter
 * @param  string - string to be Lower cased
 */
export const lowerize = (string: string): string => {
    const result = string.trim()
    return result.charAt(0).toLowerCase() + result.slice(1)
}

export const pluralize = (str: string): string => {
    let result: string = inflection.underscore(str).trim()
    result = inflection.humanize(result)
    const resultSplit: string[] = result.split(' ')
    let lastWord = <string>resultSplit.pop();
    lastWord = inflection.pluralize(lastWord)
    return inflection.camelize([...resultSplit, lastWord].join('_'), true)
}

export const singularize = (str: string): string => {
    let result = inflection.underscore(str).trim()
    result = inflection.humanize(result)
    const resultSplit: string[] = result.split(' ')
    let lastWord = <string>resultSplit.pop()
    lastWord = inflection.singularize(lastWord)
    return inflection.camelize([...resultSplit, lastWord].join('_'), true)
}



