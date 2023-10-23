"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUrl = exports.isDomain = exports.isTopLevelDomain = exports.isEmail = exports.isRegEx = exports.isArray = exports.isDate = exports.isString = exports.isInteger = exports.isNumber = exports.isAllowed = exports.maxCount = exports.minCount = exports.maxDate = exports.minDate = exports.maxString = exports.minString = exports.extraKey = exports.minNumberExclusive = exports.minNumber = exports.maxNumberExclusive = exports.maxNumber = exports.isNoEmpty = exports.required = exports.noEmpty = void 0;
var ValidatorCreator_1 = require("./ValidatorCreator");
var exists = function (value) { return value !== null && value !== undefined; };
var noEmpty = function (value) {
    if (value && value.id)
        return true;
    return typeof value === 'object' && Object.keys(value).length > (value.hasOwnProperty('id') ? 1 : 0) && Object.keys(value).filter(function (k) { return value[k] !== null && value[k] !== undefined; }).length > 0;
};
exports.noEmpty = noEmpty;
exports.required = new ValidatorCreator_1.ValidatorCreator(exists, 'required', '{{label}} is required');
exports.isNoEmpty = new ValidatorCreator_1.ValidatorCreator(exports.noEmpty, 'noEmpty', '{{label}} is required', false, true);
exports.maxNumber = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return value <= param; }, 'maxNumber', '{{label}} cannot exceed {{param}}');
exports.maxNumberExclusive = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return value < param; }, 'maxNumberExclusive', '{{label}} must be less than {{param}}');
exports.minNumber = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return value >= param; }, 'minNumber', '{{label}} must be at least {{param}}');
exports.minNumberExclusive = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return value > param; }, 'minNumberExclusive', '{{label}} must be greater than {{param}}');
exports.extraKey = new ValidatorCreator_1.ValidatorCreator(function (value, param) {
    if (param === void 0) { param = true; }
    return !param;
}, 'extraKey', 'Extra key {{value}} found at {{label}}');
exports.minString = new ValidatorCreator_1.ValidatorCreator(function (value, param) {
    if (param === void 0) { param = true; }
    return !exists(value) || value.length >= param;
}, 'minString', '{{label}} must be at least {{param}} characters');
exports.maxString = new ValidatorCreator_1.ValidatorCreator(function (value, param) {
    if (param === void 0) { param = true; }
    return !exists(value) || value.length <= param;
}, 'maxString', '{{label}} cannot exceed {{param}} characters');
exports.minDate = new ValidatorCreator_1.ValidatorCreator(function (value, param) {
    if (param === void 0) { param = true; }
    return !exists(value) || value.getTime() <= param.getTime();
}, 'minDate', '{{label}} must be on or after {{param}}');
exports.maxDate = new ValidatorCreator_1.ValidatorCreator(function (value, param) {
    if (param === void 0) { param = true; }
    return !exists(value) || value.getTime() >= param.getTime();
}, 'maxDate', '{{label}} cannot be after {{param}}');
exports.minCount = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return Array.isArray(value) && value.length >= param; }, 'minCount', '{{label}} must specify at least {{param}} values', true);
exports.maxCount = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return Array.isArray(value) && value.length <= param; }, 'maxCount', '{{label}} cannot specify more than {{param}} values', true);
exports.isAllowed = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return !exists(value) || param.includes(value); }, 'isAllowed', '{{label}} has not an allowed value "{{value}}", allowed values are {{param}}');
exports.isNumber = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || typeof value === 'number'; }, 'isNumber', '{{label}} must be an integer');
exports.isInteger = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || typeof value === 'number' && value % 1 === 0; }, 'isInteger', '{{label}} must be an integer');
exports.isString = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || typeof value === 'string'; }, 'isString', '{{label}} must be an string');
exports.isDate = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || value instanceof Date; }, 'isDate', '{{label}} is not a valid date');
exports.isArray = new ValidatorCreator_1.ValidatorCreator(function (value) { return exists(value) && Array.isArray(value); }, 'isArray', "{{label}} should be a array", true);
exports.isRegEx = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return !exists(value) || param.test(value); }, 'isRegEx', "{{label}} has an invalid format");
exports.isEmail = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value); }, 'isEmail', "{{label}} has an invalid format");
exports.isTopLevelDomain = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || /^(\w+\.\w{2,63})$/.test(value); }, 'isTopLevelDomain', "{{label}} has an invalid format");
exports.isDomain = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || /^(\w+\.)?(\w+\.\w{2,63})$/.test(value); }, 'isDomain', "{{label}} has an invalid format");
exports.isUrl = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(value); }, 'isUrl', "{{label}} has an invalid format");
//# sourceMappingURL=Validators.js.map