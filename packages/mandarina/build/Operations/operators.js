"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evalWhere = void 0;
var lodash_1 = require("lodash");
/**
 *  take a model, and evaluate the where clause (a prisma where shape) and return if the model complain with the clause
 * @param obj
 * @param where
 * @param path
 */
var evalWhere = function (obj, where, path) {
    if (path === void 0) { path = []; }
    for (var condition in where) {
        if (!where.hasOwnProperty(condition))
            continue;
        var operator = condition.substr(condition.indexOf('_') + 1);
        var key = condition.substr(0, condition.indexOf('_')) || operator;
        var right = where[condition];
        var left = (0, lodash_1.get)(obj, __spreadArray(__spreadArray([], path, true), [key], false));
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
                return new RegExp("^".concat(right), 'i').test(left);
            case "not_starts_with":
                return !new RegExp("^".concat(right), 'i').test(left);
            case "ends_with":
                return new RegExp("".concat(right, "$"), 'i').test(left);
            case "not_ends_with":
                return !new RegExp("".concat(right, "$"), 'i').test(left);
            default:
                if (typeof right === 'object' && right) {
                    return (0, exports.evalWhere)(obj, right, __spreadArray(__spreadArray([], path, true), [operator], false));
                }
                return left === right;
        }
    }
    return true;
};
exports.evalWhere = evalWhere;
var and = function (obj, whereList, path) {
    if (path === void 0) { path = []; }
    for (var _i = 0, whereList_1 = whereList; _i < whereList_1.length; _i++) {
        var where = whereList_1[_i];
        if (!(0, exports.evalWhere)(obj, where, path))
            return false;
    }
    return true;
};
var or = function (obj, whereList, path) {
    if (path === void 0) { path = []; }
    for (var _i = 0, whereList_2 = whereList; _i < whereList_2.length; _i++) {
        var where = whereList_2[_i];
        if ((0, exports.evalWhere)(obj, where, path))
            return true;
    }
    return false;
};
var not = function (obj, whereList, path) {
    if (path === void 0) { path = []; }
    for (var _i = 0, whereList_3 = whereList; _i < whereList_3.length; _i++) {
        var where = whereList_3[_i];
        if ((0, exports.evalWhere)(obj, where, path))
            return false;
    }
    return true;
};
//# sourceMappingURL=operators.js.map