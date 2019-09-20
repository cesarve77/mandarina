"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Compile a template for the a error messages based on label, arguments, and template itself
 * @param label - Humanize type of field
 * @param template - error template message, like {{label}} is required!, for argumens the search pararm is like {{arg[0]}},  {{arg[1]}} ... etc
 * @param value - validated value
 * @param args - other params of the validatios
 */
exports.compileMessage = function (_a) {
    var label = _a.label, template = _a.template, value = _a.value, param = _a.param;
    var message = template.replace(/\{\{label\}\}/gi, label);
    message = message.replace(/\{\{value\}\}/gi, value);
    message = message.replace(/\{\{param\}\}/gi, param);
    return message;
};
var ValidatorCreator = /** @class */ (function () {
    function ValidatorCreator(validation, name, template, arrayValidator) {
        if (template === void 0) { template = '{{label}} is invalid.'; }
        if (arrayValidator === void 0) { arrayValidator = false; }
        this.validation = validation;
        this.template = template;
        this.name = name;
        this.arrayValidator = arrayValidator;
        ValidatorCreator.instances = ValidatorCreator.instances || {};
        if (ValidatorCreator.instances[name])
            throw new Error("Validator named " + name + " already exists, names should be uniques");
        ValidatorCreator.instances[name] = this;
    }
    ValidatorCreator.getInstance = function (name) {
        var instance = ValidatorCreator.instances[name];
        if (!instance)
            throw new Error("No Validator named " + name);
        return instance;
    };
    ValidatorCreator.prototype.setTemplate = function (template) {
        this.template = template;
        return this;
    };
    /**
     * alias for getValidatorWithParam
     * @param param - limits of validation, for example for min is the min value
     */
    ValidatorCreator.prototype.with = function (param) {
        return this.getValidatorWithParam(param);
    };
    /**
     * any param to limit the validator, for example min or max.
     * it return a function to receive ValidatorParams
     * @param param
     * @return {function}
     */
    ValidatorCreator.prototype.getValidatorWithParam = function (param) {
        var _a;
        var name = this.name;
        var validation = this.validation;
        var template = this.template;
        var arrayValidator = this.arrayValidator;
        var validator = (_a = /** @class */ (function () {
                function Validator(_a) {
                    var key = _a.key, definition = _a.definition, path = _a.path, value = _a.value;
                    this.key = key;
                    this.definition = definition;
                    this.label = definition.label ? definition.label : "";
                    if (Array.isArray(definition.type)) {
                        this.type = definition.type[0];
                    }
                    else {
                        this.type = definition.type;
                    }
                    this.value = value;
                    this.path = path;
                }
                Validator.prototype.validate = function (model) {
                    var context = { model: model };
                    if (!validation.call(context, this.value, Validator.param)) {
                        return {
                            key: this.key,
                            label: this.label,
                            message: exports.compileMessage({ label: this.label, template: template, param: Validator.param, value: this.value }),
                            value: this.value,
                            validatorName: name,
                            path: this.path,
                        };
                    }
                    return undefined;
                };
                return Validator;
            }()),
            _a.arrayValidator = arrayValidator,
            _a.validatorName = name,
            _a);
        validator.param = param;
        validator.arrayValidator = arrayValidator;
        return validator;
    };
    return ValidatorCreator;
}());
exports.ValidatorCreator = ValidatorCreator;
var ValidateFunction;
(function (ValidateFunction) {
})(ValidateFunction = exports.ValidateFunction || (exports.ValidateFunction = {}));
