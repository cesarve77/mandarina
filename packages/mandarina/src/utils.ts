export const getDecendents = (keys: string[], parent: string) => { //todo optimize to just one loop
    parent = parent.replace(/\.\d/g, '.')
    parent = parent.replace(/\.$/, '')
    const regEx = new RegExp(`^${parent}\\.`)
    return keys.filter(key => key.match(regEx)).map(key => key.replace(regEx, ''))
}


export const getParents = (keys: string[]) => {
    const parents: string[] = []
    keys.forEach((key) => {
        const first = key.split('.').shift()
        if (first && !parents.includes(first)) parents.push(first)
    })
    return parents
}


export const ensureId = (fields: string[]) => {
    const result: string[] = []
    fields.forEach((field) => {
        const dot = field.lastIndexOf('.')
        if (dot > 0) {
            const fieldId = field.substr(0, dot ) + '.id'
            if (!fields.includes(fieldId) && !result.includes(fieldId)) {
                result.push(fieldId)
            }
        }
        result.push(field)
    })
    return result
}

export const filterFields = (allFields: string[], optionalFields?: string[], omitFields?: string[], omitRegEx?: RegExp) => {
    let result = !optionalFields ? allFields : optionalFields.filter((field) => allFields.some((optional) => field === optional || field.indexOf(optional + '.') === 0))

    if (omitFields) {
        omitFields = omitFields.map(omit => omit.replace('.', '\\.'))
        result = result.filter(field => !(omitFields as string[]).some(omit => !!field.match(new RegExp(`^${omit}$|^${omit}\\.`))))
    }
    if (omitRegEx) {
        result = result.filter(field => !field.match(omitRegEx))
    }
    return result
}

