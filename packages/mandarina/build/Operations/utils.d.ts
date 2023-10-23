import { Having } from "./Find";
/**
 * get grqphql string from a list of field in dot notation
 * @param  keys - list of fields in dot notation
 * @return  grqphql string
 */
export declare const buildQueryFromFields: (keys: string[], sureId?: boolean) => string;
export declare const insertHaving: (qs: string, having?: Having) => string;
