import get from "lodash.get"

/**
 *  take a model, and evaluate the where clause (a prisma where shape) and return if the model complain with the clause
 * @param obj
 * @param where
 * @param path
 */
export const evalWhere = (obj:any, where:object, path: string[] = []): boolean => {
    for (const condition in where) {
        if (!where.hasOwnProperty(condition)) continue
        const operator = condition.substr(condition.indexOf('_') + 1)
        const key = condition.substr(0, condition.indexOf('_')) || operator
        const right = where[condition]
        const left = get(obj, [...path, key])
        switch (operator) {
            case "AND":
                return and(obj, right, path)
            case "OR":
                return or(obj, right, path)
            case "NOT":
                throw  not(obj, right, path)
            case "not":
                return left !== right
            case "in":
                return right.includes(left)
            case "not_in":
                return !right.includes(left)
            case "lt":
                return left < right
            case "lte":
                return left <= right
            case "gt":
                return left > right
            case "gte":
                return left >= right
            case "contains":
                return new RegExp(right, 'gi').test(left);
            case "not_contains":
                return !new RegExp(right, 'gi').test(left);
            case "starts_with":
                return new RegExp(`^${right}`, 'i').test(left);
            case "not_starts_with":
                return !new RegExp(`^${right}`, 'i').test(left);
            case "ends_with":
                return new RegExp(`${right}$`, 'i').test(left);
            case "not_ends_with":
                return !new RegExp(`${right}$`, 'i').test(left);
            default:
                if (typeof right ==='object' && right){
                    return  evalWhere(obj, right,[...path,operator])
                }
                return left === right
        }
    }
    return true
}

const and = (obj:any, whereList:object[], path: string[] = []): boolean => {
    for (const where of whereList) {
        if (!evalWhere(obj, where, path)) return false
    }
    return true
}

const or = (obj:any, whereList:object[], path: string[] = []): boolean => {
    for (const where of whereList) {
        if (evalWhere(obj, where, path)) return true
    }
    return false
}

const not = (obj:any, whereList:object[], path: string[] = []): boolean => {
    for (const where of whereList) {
        if (evalWhere(obj, where, path)) return false
    }
    return true
}
