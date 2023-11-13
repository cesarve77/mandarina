"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.Bridge = void 0;
var mandarina_1 = require("mandarina");
var lodash_1 = require("lodash");
var Mutate_1 = require("mandarina/build/Operations/Mutate");
var utils_1 = require("mandarina/build/utils");
var Bridge = /** @class */ (function () {
    function Bridge(schema, fields, overwrite) {
        var _this = this;
        this.fieldDefinitions = {};
        this.fieldProps = {};
        this.getAncestors = function (field) {
            var lastDot = field.lastIndexOf('.');
            if (lastDot >= 0) {
                var parent_1 = field.substring(0, lastDot);
                return __spreadArray(__spreadArray([], _this.getAncestors(parent_1), true), [parent_1], false);
            }
            return [];
        };
        if (!schema)
            throw new Error('Param "schema" missing creating a new Bridge');
        if (!fields)
            throw new Error('Param "fields" missing creating a new Bridge');
        this.fields = fields;
        this.schema = schema;
        this.overwrite = overwrite;
    }
    Bridge.check = function (schema) {
        return schema instanceof mandarina_1.Schema;
    };
    // Field's scoped error.
    Bridge.prototype.getError = function (name, error) {
        if (error && typeof error.message === 'string' && this.schema.errorFromServerMapper) {
            return this.schema.errorFromServerMapper(name, error);
        }
        if (error && Object.keys(error).some(function (e) { return e.match(new RegExp("^".concat(name, "\\."))); }))
            return true;
        return error && error[name];
    };
    Bridge.prototype.getErrorMessage = function (name, error) {
        if (error && typeof error.message === 'string' && this.schema.errorFromServerMapper) {
            return this.schema.errorFromServerMapper(name, error);
        }
        return error && error[name];
    };
    // All error messages from error.
    Bridge.prototype.getErrorMessages = function (error) {
        var _this = this;
        //for errors coming from server
        if (error && typeof error.message === 'string') {
            //todo checck cuando las porpiedades que sobran
            if (this.schema.errorFromServerMapper) {
                var errors_1 = [];
                this.fields.forEach(function (field) {
                    var serverError = _this.schema.errorFromServerMapper && _this.schema.errorFromServerMapper(field, error);
                    if (serverError)
                        errors_1.push(serverError);
                });
                if (errors_1.length)
                    return errors_1;
            }
            return [error.message.replace('GraphQL error:', '')];
        }
        //for errors generates here
        if (error) {
            return Object.keys(error).map(function (field) { return error[field]; });
        }
        return [];
    };
    // Field's definition (`field` prop).
    Bridge.prototype.getField = function (name) {
        var field = mandarina_1.Schema.cleanKey(name);
        var overwrite = this.overwrite && this.overwrite[field];
        if (!this.fieldDefinitions[field])
            this.fieldDefinitions[field] = overwrite ? (0, lodash_1.merge)((0, Mutate_1.deepClone)(this.schema.getPathDefinition(field)), overwrite) : this.schema.getPathDefinition(field);
        if (!this.fieldDefinitions[field] || !this.fieldDefinitions[field].type)
            throw new Error("No field named \"".concat(field, "\" in schema ").concat(this.schema.name));
        return this.fieldDefinitions[field];
    };
    Bridge.prototype.getType = function (name) {
        var def = this.getField(name);
        if (name.match(/\.(\d|\$)+$/)) {
            if (def.isTable)
                return Object;
        }
        else {
            if (def.isArray)
                return Array;
            if (def.isTable)
                return Object;
        }
        return def.type;
    };
    // Field's initial value.
    Bridge.prototype.getInitialValue = function (name, props) {
        if (props === void 0) { props = {}; }
        var field = this.getField(name);
        var type = this.getType(name);
        if (type === Array && typeof field.type === 'string') {
            var validators = field.validators;
            var minCount_1 = 0;
            var initialCount = field.form && field.form.props && field.form.props.initialCount || 0;
            validators.forEach(function (validator) {
                if (validator.validatorName === 'minCount')
                    minCount_1 = validator.param;
            });
            var item = {};
            var schema = mandarina_1.Schema.getInstance(field.type);
            schema.clean(item, (0, utils_1.getDecendentsDot)(this.fields, name));
            var items = Math.max(minCount_1, initialCount);
            return new Array(items).fill(item);
        }
        if (type === Array) {
            var validators = field.validators;
            var minCount_2 = 0;
            var initialCount = field.form && field.form.props && field.form.props.initialCount || 0;
            validators.forEach(function (validator) {
                if (validator.validatorName === 'minCount')
                    minCount_2 = validator.param;
            });
            var item = field.defaultValue;
            var items = Math.max(minCount_2, initialCount);
            return new Array(items).fill(item);
        }
        else if (type === Object) {
            var item = {};
            if (field.isTable) {
                var schema = mandarina_1.Schema.getInstance(field.type);
                schema.clean(item, (0, utils_1.getDecendentsDot)(this.fields, name));
            }
            return item;
        }
        return field.defaultValue;
    };
    Bridge.prototype.getSubfields = function (name) {
        if (!name) {
            return this.schema.keys;
        }
        var field = this.getField(name);
        // if (field.isTable && name.match(/\.\d+$/)) {
        if (field.isTable) {
            var schema = mandarina_1.Schema.getInstance(field.type);
            return schema.keys;
        }
        else {
            return [];
        }
    };
    Bridge.prototype.findValidator = function (validatorName, field) {
        var def;
        var validators = [];
        if (typeof field === 'string') {
            def = this.getField(field);
        }
        else {
            def = field;
        }
        if (def.validators && def.validators.some(function (v) { return typeof v === 'string'; })) {
            validators = mandarina_1.Schema.mapValidators(def.validators);
        }
        else {
            validators = (def.validators || []);
        }
        for (var _i = 0, validators_1 = validators; _i < validators_1.length; _i++) {
            var validator = validators_1[_i];
            if (validator.validatorName === validatorName)
                return validator;
        }
        return;
    };
    // Field's props.
    Bridge.prototype.getProps = function (name, props) {
        if (props === void 0) { props = {}; }
        if (!this.fieldProps[name]) {
            var field = this.getField(name);
            var transform = field.form && field.form.props && field.form.props.transform;
            var validatorIsAllowed = this.findValidator('isAllowed', field);
            var allowedValues = undefined;
            if (validatorIsAllowed)
                allowedValues = validatorIsAllowed.param;
            var cleanName = mandarina_1.Schema.cleanKey(name);
            var required = !!(this.findValidator('required', field) || this.findValidator('noEmpty', field)
                || (this.overwrite && this.overwrite[cleanName] && !!this.findValidator('required', this.overwrite[cleanName])));
            var uniforms = field.form, component = field.form.component;
            var placeholder = field.form && field.form.props && field.form.props.placeholder;
            if (props.placeholder === false || props.placeholder === null) {
                placeholder = '';
            }
            var minCount_3 = 0;
            var maxCount_1 = 9999;
            field.validators.forEach(function (validator) {
                if (validator.validatorName === 'minCount')
                    minCount_3 = validator.param;
                if (validator.validatorName === 'maxCount')
                    maxCount_1 = validator.param;
            });
            this.fieldProps[name] = __assign(__assign({ label: field.label ? field.label : "", allowedValues: allowedValues, minCount: minCount_3, maxCount: maxCount_1, transform: transform, component: component, required: required, placeholder: placeholder }, uniforms), field.form.props);
        }
        return this.fieldProps[name];
        /**
         min?: number | Date;
         max?: number | Date;
         exclusiveMin?: boolean;
         exclusiveMax?: boolean;
         minCount?: number;
         maxCount?: number;
         optional?: boolean;
         allowedValues?: any[];
         regEx?: RegExp;
         blackbox?: boolean;
         trim?: boolean;
         custom?: Function;
         autoValue?: Function;
         */
    };
    // Function with one argument - model - which throws errors when model is
    // invalid.
    Bridge.prototype.getValidator = function () {
        var _this = this;
        return function (model) {
            var enter = false;
            var errors = _this.schema.validate(model, _this.fields, _this.overwrite);
            if (errors.length) {
                var error_1 = {};
                errors.forEach(function (e) {
                    if (_this.fields.includes(mandarina_1.Schema.cleanKey(e.path))) {
                        enter = true;
                        error_1[e.path] = e.message;
                    }
                });
                if (enter)
                    throw __assign({}, error_1);
            }
        };
    };
    return Bridge;
}());
exports.Bridge = Bridge;
//# sourceMappingURL=Bridge.js.map