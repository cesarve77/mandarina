import {Filter} from "./Table";
import {UserType} from "../Mandarina";
import {unflatten} from "flat";

/**
 * get grqphql string from a list of field in dot notation
 * @param  keys - list of fields in dot notation
 * @return  grqphql string
 */
export const buildQueryFromFields = (keys: string[], user: UserType, filters: Filter) => {
    let fields = [...keys]
    const parents = getParentsDot(fields)

    const fieldsToFilter = Object.keys(filters).reduce(
        (obj, field) => parents.some(parent=>field.match(new RegExp(`^${parent}\.|^${parent}$`))) && filters[field].roles.some((r: string) => user.roles.includes(r))
            ? Object.assign(obj, {[field]: filters[field]}) : {}, {})
    fields = fields.map((field) => field.replace(/\.\$(\.?)/g, '$1'))

    const fieldsFlat = fields.reduce((obj, key) => Object.assign(obj, {[key]: {}}), {})

    Object.keys(fieldsToFilter).forEach(fieldToFilter => {
        fieldsFlat[fieldToFilter] = fieldsToFilter[fieldToFilter].value
    })

    const obj = unflatten(fieldsFlat)
    return JSON.stringify(obj).replace(/\{\}|\"|\:|null/g, '')
}

export const getParentsDot = (keys: string[]) => {
    const parents: string[] = []
    keys.forEach((key) => {
        const first = key.split('.').shift()
        if (first && !parents.includes(first)) parents.push(first)
    })
    return parents
}

