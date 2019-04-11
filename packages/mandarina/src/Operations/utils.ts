import {unflatten} from "flat";

/**
 * get grqphql string from a list of field in dot notation
 * @param  keys - list of fields in dot notation
 * @return  grqphql string
 */
export const buildQueryFromFields = (keys:string[]) => {
    let fields=[...keys]
    if (!fields.includes('id')){
        fields.push('id')
    }
    fields = fields.map((field) => field.replace(/\.\$(\.?)/g, '$1'))
    const fieldsFlat = fields.reduce((obj, key) => Object.assign(obj, {[key]: {}}), {})
    const obj = unflatten(fieldsFlat)
    return JSON.stringify(obj).replace(/\{\}|\"|\:|null/g, '')
}
