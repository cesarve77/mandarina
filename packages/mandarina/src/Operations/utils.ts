import {unflatten} from "flat";

/**
 * get grqphql string from a list of field in dot notation
 * @param  keys - list of fields in dot notation
 * @return  grqphql string
 */
export const buildQueryFromFields = (keys:string[]) => {
    keys = keys.map((field) => field.replace(/\.\$(\.?)/g, '$1'))
    const fields = keys.reduce((obj, key) => Object.assign(obj, {[key]: {}}), {})
    const obj = unflatten(fields)
    return JSON.stringify(obj).replace(/\{\}|\"|\:|null/g, '')
}
