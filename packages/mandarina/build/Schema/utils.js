"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.singularize = exports.pluralize = exports.lowerize = exports.capitalize = exports.get = exports.hasValidator = exports.isRequired = exports.forceType = void 0;
var Schema_1 = require("./Schema");
var inflection = __importStar(require("inflection"));
//code borrowed from https://github.com/aldeed/simple-schema-js/blob/master/package/lib/clean/convertToProperType.js
var forceType = function (value, type) {
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
        if (!value)
            return null;
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
exports.forceType = forceType;
var isRequired = function (field) { return (0, exports.hasValidator)(field.validators, 'required') || (0, exports.hasValidator)(field.validators, 'noEmpty'); };
exports.isRequired = isRequired;
var hasValidator = function (validators, name) {
    if (!name)
        return false;
    var filtered = validators.filter(function (_a) {
        var validatorName = _a.validatorName;
        return validatorName === name;
    });
    return !!filtered.length;
};
exports.hasValidator = hasValidator;
var get = function (obj, paths) {
    if (obj === void 0) { obj = {}; }
    var result = [];
    var len = paths.length;
    for (var i = 0; i < len; i++) {
        var path = paths[i];
        paths = paths.slice(i + 1);
        if (obj === null) {
            result.push(null);
            return result;
        }
        var val = obj[path];
        if (Array.isArray(val)) {
            val.forEach(function (val) {
                if (paths.length === 0) {
                    result.push(val);
                }
                else {
                    result.push.apply(result, (0, exports.get)(val, paths));
                }
            });
        }
        else if (val === 0 || val === false || val) {
            if (paths.length === 0) {
                result.push(val);
                return result;
            }
            else {
                result.push.apply(result, (0, exports.get)(val, paths));
                return result;
            }
        }
    }
    return result;
};
exports.get = get;
/**
 * Upper case the first latter
 * @param  string - string to be upper cased
 */
var capitalize = function (string) {
    var result = string.trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
};
exports.capitalize = capitalize;
/**
 * Lower case the first latter
 * @param  string - string to be Lower cased
 */
var lowerize = function (string) {
    var result = string.trim();
    return result.charAt(0).toLowerCase() + result.slice(1);
};
exports.lowerize = lowerize;
var pluralize = function (str) {
    var result = inflection.underscore(str).trim();
    result = inflection.humanize(result);
    var resultSplit = result.split(' ');
    var lastWord = resultSplit.pop();
    lastWord = inflection.pluralize(lastWord);
    if (lastWord === 'logos') {
        lastWord = 'logoes';
    }
    return inflection.camelize(__spreadArray(__spreadArray([], resultSplit, true), [lastWord], false).join('_'), true);
};
exports.pluralize = pluralize;
var singularize = function (str) {
    var result = inflection.underscore(str).trim();
    result = inflection.humanize(result);
    var resultSplit = result.split(' ');
    var lastWord = resultSplit.pop();
    lastWord = inflection.singularize(lastWord);
    return inflection.camelize(__spreadArray(__spreadArray([], resultSplit, true), [lastWord], false).join('_'), true);
};
exports.singularize = singularize;
//# sourceMappingURL=utils.js.map