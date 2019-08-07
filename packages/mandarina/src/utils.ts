export const getDecendentsDot = (keys: string[], parent: string) => { //todo optimize to just one loop
    parent = parent.replace(/\.\d/g, '.')
    parent = parent.replace(/\.$/, '')
    const regEx = new RegExp(`^${parent}\\.`)
    return keys.filter(key => key.match(regEx)).map(key => key.replace(regEx, ''))
}


export const getParentsDot = (keys: string[]) => {
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
