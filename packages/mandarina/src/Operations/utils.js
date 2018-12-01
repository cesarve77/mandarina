"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var flat_1 = require("flat");
/**
 * get grqphql string from a list of field in dot notation
 * @param  keys - list of fields in dot notation
 * @return  grqphql string
 */
exports.buildQueryFromFields = function (keys) {
    keys = keys.map(function (field) { return field.replace(/\.\$(\.?)/g, '$1'); });
    var fields = keys.reduce(function (obj, key) {
        var _a;
        return Object.assign(obj, (_a = {}, _a[key] = {}, _a));
    }, {});
    var obj = flat_1.unflatten(fields);
    return JSON.stringify(obj).replace(/\{\}|\"|\:|null/g, '');
};
