

export const getDecendents = (keys: string[], parent: string) => { //todo optimize to just one loop
    parent = parent.replace(/\.\d/g, '.')
    parent = parent.replace(/\.$/, '')
    const regEx = new RegExp(`^${parent}\.`)
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


export const filterFields=(fields: string[],omitFields?: string[],omitRegEx?: RegExp)=>{
    let result=[...fields]
    if (omitFields){
        omitFields = omitFields.map(omit => omit.replace('.', '\\.'))
        result = fields.filter(field => !(omitFields as string[]).some(omit => !!field.match(new RegExp(`^${omit}$|^${omit}\\.`))))
    }
    if (omitRegEx) {
        result = result.filter(field => !field.match(omitRegEx))
    }
    return result
}