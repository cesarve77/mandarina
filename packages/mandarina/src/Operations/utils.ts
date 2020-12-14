import {unflatten} from "flat";
import {ensureId} from "../utils";
import {Having} from "./Find";
import stringifyObject from 'stringify-object'

/**
 * get grqphql string from a list of field in dot notation
 * @param  keys - list of fields in dot notation
 * @return  grqphql string
 */
export const buildQueryFromFields = (keys: string[], sureId = true) => {
    let fields = [...keys]
    if (sureId && !fields.includes('id')) {
        fields.push('id')
    }
    fields = fields.map((field) => field.replace(/\.\$(\.?)/g, '$1'))
    if (sureId) fields = ensureId(fields)
    const fieldsFlat = fields.reduce((obj, key) => Object.assign(obj, {[key]: {}}), {})
    const obj = unflatten(fieldsFlat)
    return JSON.stringify(obj).replace(/\{\}|\"|\:|null/g, '')
}


export const insertHaving = (qs: string, having?: Having) => {
    if (!having) return qs
    qs = qs.substring(1, qs.length - 1)
    const inserts: string[] = []
    const parents = []
    const havingParents = Object.keys(having)
    for (let i = 0; i < qs.length; i++) {
        const c = qs[i]
        if (c === '{') {
            const sub = qs.substring(0, i)
            const regEx = (/(\w+$)/)
            // @ts-ignore
            const lastWord = regEx.exec(sub)[0]
            parents.push(lastWord)
            const path = parents.join('.')
            if (havingParents.includes(path)) {
                inserts[i] = path
            }
        }
        if (c === '}') {
            parents.pop()
        }
    }
    let result = qs
    for (let i = inserts.length - 1; i >= 0; i--) {
        if (!inserts[i]) continue
        const variables = Object.keys(having[inserts[i]])
        let txt = variables.map(v => {
            return `${v}:${stringifyObject(having[inserts[i]][v], {
                indent: '',
                singleQuotes: false
            })}`
        }).join(',')
        result = `${result.slice(0, i)}(${txt.replace(/("|\(|\))/g,"\$1")})${result.slice(i)}`

    }
    return `{${result}}`.replace(/\n|\t/g, '')
}
