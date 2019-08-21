import {unflatten} from "flat";
import {ensureId} from "../utils";

/**
 * get grqphql string from a list of field in dot notation
 * @param  keys - list of fields in dot notation
 * @return  grqphql string
 */
export const buildQueryFromFields = (keys: string[]) => {
    let fields = [...keys]
    if (!fields.includes('id')) {
        fields.push('id')
    }
    fields = fields.map((field) => field.replace(/\.\$(\.?)/g, '$1'))
    fields = ensureId(fields)
    const fieldsFlat = fields.reduce((obj, key) => Object.assign(obj, {[key]: {}}), {})
    const obj = unflatten(fieldsFlat)
    return JSON.stringify(obj).replace(/\{\}|\"|\:|null/g, '')
}

export const generateUUID = () => {
    const s1 = (new Date().getTime() + 33853318889500 - 35).toString(36)
    const s2= (Math.floor(Math.random() * (1099511627775 - 34359738368)) + 34359738368).toString(36)
    const s3= (Math.floor(Math.random() * (1099511627775 - 34359738368)) + 34359738368).toString(36)
    return s1+(s2+s3).substr(0,16)
}
