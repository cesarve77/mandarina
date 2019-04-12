"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var flat_1 = require("flat");
/**
 * get grqphql string from a list of field in dot notation
 * @param  keys - list of fields in dot notation
 * @return  grqphql string
 */
exports.buildQueryFromFields = function (keys) {
    var fields = keys.slice();
    if (!fields.includes('id')) {
        fields.push('id');
    }
    fields = fields.map(function (field) { return field.replace(/\.\$(\.?)/g, '$1'); });
    var fieldsFlat = fields.reduce(function (obj, key) {
        var _a;
        return Object.assign(obj, (_a = {}, _a[key] = {}, _a));
    }, {});
    var obj = flat_1.unflatten(fieldsFlat);
    return JSON.stringify(obj).replace(/\{\}|\"|\:|null/g, '');
};
