"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ValidatorCreator_1 = require("./ValidatorCreator");
var exists = function (value) { return value === 0 || value; };
exports.required = new ValidatorCreator_1.ValidatorCreator(exists, 'required', '{{label}} is required');
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
    return value.length >= param;
}, 'minString', '{{label}} must be at least {{param}} characters');
exports.maxString = new ValidatorCreator_1.ValidatorCreator(function (value, param) {
    if (param === void 0) { param = true; }
    return value.length <= param;
}, 'maxString', '{{label}} cannot exceed {{param}} characters');
exports.minDate = new ValidatorCreator_1.ValidatorCreator(function (value, param) {
    if (param === void 0) { param = true; }
    return value.getTime() <= param.getTime();
}, 'minDate', '{{label}} must be on or after {{param}}');
exports.maxDate = new ValidatorCreator_1.ValidatorCreator(function (value, param) {
    if (param === void 0) { param = true; }
    return value.getTime() >= param.getTime();
}, 'maxDate', '{{label}} cannot be after {{param}}');
exports.minCount = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return Array.isArray(value) && value.length >= param; }, 'minCount', '{{label}} must specify at least {{param}} values', true);
exports.maxCount = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return Array.isArray(value) && value.length <= param; }, 'maxCount', '{{label}} cannot specify more than {{param}} values', true);
exports.isAllowed = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return !exists(value) || param.includes(value); }, 'isAllowed', '{{label}} has not an allowed value "{{value}}"');
exports.isNumber = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || typeof value === 'number'; }, 'isNumber', '{{label}} must be an integer');
exports.isInteger = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || typeof value === 'number' && value % 1 === 0; }, 'isInteger', '{{label}} must be an integer');
exports.isString = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || typeof value === 'string'; }, 'isString', '{{label}} must be an string');
exports.isDate = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || value instanceof Date; }, 'isDate', '{{label}} is not a valid date');
exports.isArray = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || Array.isArray(value); }, 'isArray', "{{label}} should be a array", true);
exports.isRegEx = new ValidatorCreator_1.ValidatorCreator(function (value, param) { return !exists(value) || param.test(value); }, 'isRegEx', "{{label}} has an invalid format");
exports.isEmail = new ValidatorCreator_1.ValidatorCreator(function (value) { return !exists(value) || /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value); }, 'isEmail', "{{label}} has an invalid format");
