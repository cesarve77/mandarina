"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Schema_1 = require("./Schema");
var inflection = require("inflection");
//code borrowed from https://github.com/aldeed/simple-schema-js/blob/master/package/lib/clean/convertToProperType.js
exports.forceType = function (value, type) {
    if (Array.isArray(value) ||
        (value && (typeof value === 'function' || typeof value === 'object') && !(value instanceof Date)) ||
        value === null)
        return value;
    // Convert to String type
    if (type === String) {
        if (value === null || value === undefined)
            return value;
        return value.toString();
    }
    // Convert to Number type
    if (type === Number || type === Schema_1.Integer) {
        if (typeof value === 'string' && value.length > 0) {
            // Try to convert numeric strings to numbers
            var numberVal = Number(value);
            if (!isNaN(numberVal))
                return numberVal;
        }
        // Leave it; will fail validation
        return value;
    }
    // If target type is a Date we can safely convert from either a
    // number (Integer value representing the number of milliseconds
    // since 1 January 1970 00:00:00 UTC) or a string that can be parsed
    // by Date.
    if (type === Date) {
        if (typeof value === 'string') {
            var parsedDate = Date.parse(value);
            if (!isNaN(parsedDate))
                return new Date(parsedDate);
        }
        if (typeof value === 'number')
            return new Date(value);
    }
    // Convert to Boolean type
    if (type === Boolean) {
        if (typeof value === 'string') {
            // Convert exact string 'true' and 'false' to true and false respectively
            if (value.toLowerCase() === 'true')
                return true;
            else if (value.toLowerCase() === 'false')
                return false;
        }
        else if (typeof value === 'number' && !isNaN(value)) { // NaN can be error, so skipping it
            return Boolean(value);
        }
    }
    // If an array is what you want, I'll give you an array
    if (type === Array) {
        if (value !== 0 && value)
            return [value];
        return [];
    }
    // Could not convert
    return value;
};
exports.isRequired = function (field) { return exports.hasValidator(field.validators, 'required') || exports.hasValidator(field.validators, 'noEmpty'); };
exports.hasValidator = function (validators, name) {
    if (!name)
        return false;
    var filtered = validators.filter(function (_a) {
        var validatorName = _a.validatorName;
        return validatorName === name;
    });
    return !!filtered.length;
};
exports.get = function (obj, paths) {
    if (obj === void 0) { obj = {}; }
    var result = [];
    var len = paths.length;
    for (var i = 0; i < len; i++) {
        var path = paths[i];
        paths = paths.slice(i + 1);
        var val = obj[path];
        if (Array.isArray(val)) {
            val.forEach(function (val) {
                if (paths.length === 0) {
                    result.push(val);
                }
                else {
                    result.push.apply(result, exports.get(val, paths));
                }
            });
        }
        else if (val) {
            if (paths.length === 0) {
                result.push(val);
                return result;
            }
            else {
                result.push.apply(result, exports.get(val, paths));
                return result;
            }
        }
    }
    return result;
};
/**
 * Upper case the first latter
 * @param  string - string to be upper cased
 */
exports.capitalize = function (string) {
    var result = string.trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
};
/**
 * Lower case the first latter
 * @param  string - string to be Lower cased
 */
exports.lowerize = function (string) {
    var result = string.trim();
    return result.charAt(0).toLowerCase() + result.slice(1);
};
exports.pluralize = function (str) {
    var result = inflection.underscore(str).trim();
    result = inflection.humanize(result);
    var resultSplit = result.split(' ');
    var lastWord = resultSplit.pop();
    lastWord = inflection.pluralize(lastWord);
    return inflection.camelize(resultSplit.concat([lastWord]).join('_'), true);
};
exports.singularize = function (str) {
    var result = inflection.underscore(str).trim();
    result = inflection.humanize(result);
    var resultSplit = result.split(' ');
    var lastWord = resultSplit.pop();
    lastWord = inflection.singularize(lastWord);
    return inflection.camelize(resultSplit.concat([lastWord]).join('_'), true);
};
