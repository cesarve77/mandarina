"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
/**
 *  take a model, and evaluate the where clause (a prisma where shape) and return if the model complain with the clause
 * @param obj
 * @param where
 * @param path
 */
exports.evalWhere = function (obj, where, path) {
    if (path === void 0) { path = []; }
    for (var condition in where) {
        if (!where.hasOwnProperty(condition))
            continue;
        var operator = condition.substr(condition.indexOf('_') + 1);
        var key = condition.substr(0, condition.indexOf('_')) || operator;
        var right = where[condition];
        var left = lodash_1.get(obj, __spreadArrays(path, [key]));
        switch (operator) {
            case "AND":
                return and(obj, right, path);
            case "OR":
                return or(obj, right, path);
            case "NOT":
                throw not(obj, right, path);
            case "not":
                return left !== right;
            case "in":
                return right.includes(left);
            case "not_in":
                return !right.includes(left);
            case "lt":
                return left < right;
            case "lte":
                return left <= right;
            case "gt":
                return left > right;
            case "gte":
                return left >= right;
            case "contains":
                return new RegExp(right, 'gi').test(left);
            case "not_contains":
                return !new RegExp(right, 'gi').test(left);
            case "starts_with":
                return new RegExp("^" + right, 'i').test(left);
            case "not_starts_with":
                return !new RegExp("^" + right, 'i').test(left);
            case "ends_with":
                return new RegExp(right + "$", 'i').test(left);
            case "not_ends_with":
                return !new RegExp(right + "$", 'i').test(left);
            default:
                if (typeof right === 'object' && right) {
                    return exports.evalWhere(obj, right, __spreadArrays(path, [operator]));
                }
                return left === right;
        }
    }
    return true;
};
var and = function (obj, whereList, path) {
    if (path === void 0) { path = []; }
    for (var _i = 0, whereList_1 = whereList; _i < whereList_1.length; _i++) {
        var where = whereList_1[_i];
        if (!exports.evalWhere(obj, where, path))
            return false;
    }
    return true;
};
var or = function (obj, whereList, path) {
    if (path === void 0) { path = []; }
    for (var _i = 0, whereList_2 = whereList; _i < whereList_2.length; _i++) {
        var where = whereList_2[_i];
        if (exports.evalWhere(obj, where, path))
            return true;
    }
    return false;
};
var not = function (obj, whereList, path) {
    if (path === void 0) { path = []; }
    for (var _i = 0, whereList_3 = whereList; _i < whereList_3.length; _i++) {
        var where = whereList_3[_i];
        if (exports.evalWhere(obj, where, path))
            return false;
    }
    return true;
};
//# sourceMappingURL=operators.js.map