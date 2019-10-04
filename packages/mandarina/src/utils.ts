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


export const insertParents = (keys: string[]) => {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const parent = key.substring(0, key.lastIndexOf('.'))
        if (parent && !keys.includes(parent)) {
            keys.splice(i, 0, parent)
            i--
        }
    }
    return keys
}


export const ensureId = (fields: string[]) => {
    const result: string[] = []
    fields.forEach((field) => {
        let dot=1
        let parent=field
        while (dot > 0) {
            dot = parent.lastIndexOf('.')
            parent=parent.substr(0, dot)
            const fieldId = parent + '.id'
            if (dot>0 && !fields.includes(fieldId) && !result.includes(fieldId)) {
                result.push(fieldId)
            }
        }
        result.push(field)
    })
    return result
}

export const generateRandomNumber = (min = 0, max = 1) => Math.floor(Math.random() * (max - min + 1) + min)

export const generateRandomAlpha = (n: number = 3) => generateRandomNumber(Math.pow(36, n - 1), Math.pow(36, n)).toString(36)

export const generateUUID = (gap: number = 33853318889500) =>
    (new Date().getTime() + gap).toString(36) + generateRandomAlpha(16)

