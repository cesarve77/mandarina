/**
 *  take a model, and evaluate the where clause (a prisma where shape) and return if the model complain with the clause
 * @param obj
 * @param where
 * @param path
 */
export declare const evalWhere: (obj: any, where: object, path?: string[]) => boolean;
