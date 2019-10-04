"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var flat_1 = require("flat");
/**
 * get grqphql string from a list of field in dot notation
 * @param  keys - list of fields in dot notation
 * @return  grqphql string
 */
exports.buildQueryFromFields = function (keys, user, filters) {
    var fields = keys.slice();
    var parents = exports.getParentsDot(fields);
    var fieldsToFilter = Object.keys(filters).reduce(function (obj, field) {
        var _a;
        return parents.some(function (parent) { return field.match(new RegExp("^" + parent + ".|^" + parent + "$")); }) && filters[field].roles.some(function (r) { return user.roles.includes(r); })
            ? Object.assign(obj, (_a = {}, _a[field] = filters[field], _a)) : {};
    }, {});
    fields = fields.map(function (field) { return field.replace(/\.\$(\.?)/g, '$1'); });
    var fieldsFlat = fields.reduce(function (obj, key) {
        var _a;
        return Object.assign(obj, (_a = {}, _a[key] = {}, _a));
    }, {});
    Object.keys(fieldsToFilter).forEach(function (fieldToFilter) {
        fieldsFlat[fieldToFilter] = fieldsToFilter[fieldToFilter].value;
    });
    var obj = flat_1.unflatten(fieldsFlat);
    return JSON.stringify(obj).replace(/\{\}|\"|\:|null/g, '');
};
exports.getParentsDot = function (keys) {
    var parents = [];
    keys.forEach(function (key) {
        var first = key.split('.').shift();
        if (first && !parents.includes(first))
            parents.push(first);
    });
    return parents;
};
