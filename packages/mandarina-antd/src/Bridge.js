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
Object.defineProperty(exports, "__esModule", { value: true });
var Schema_1 = require("mandarina/build/Schema/Schema");
var Bridge = /** @class */ (function () {
    function Bridge(schemaOrTable) {
        this.fields = {};
        this.fieldProps = {};
        this.schema = schemaOrTable instanceof Schema_1.Schema ? schemaOrTable : schemaOrTable.schema;
    }
    Bridge.check = function (schema) {
        return schema instanceof Schema_1.Schema;
    };
    // Field's scoped error.
    Bridge.prototype.getError = function (name, error) {
        if (error && typeof error.message === 'string' && this.schema.errorFromServerMapper) {
            return this.schema.errorFromServerMapper(name, error);
        }
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
                this.schema.getFields().forEach(function (field) {
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
        return error
            ? Object.keys(error).map(function (field) { return error[field]; })
            : [];
    };
    // Field's definition (`field` prop).
    Bridge.prototype.getField = function (name) {
        if (!this.fields[name])
            this.fields[name] = this.schema.getPathDefinition(name);
        if (!this.fields[name] || !this.fields[name].type)
            throw new Error("No field named \"" + name + "\" in table " + this.schema.name);
        return this.fields[name];
    };
    Bridge.prototype.getType = function (name) {
        var type = this.getField(name).type;
        if (Array.isArray(type))
            return Array;
        if (typeof type === 'string')
            return Object;
        return type;
    };
    // Field's initial value.
    Bridge.prototype.getInitialValue = function (name, props) {
        if (props === void 0) { props = {}; }
        var field = this.getField(name);
        var type = this.getType(name);
        if (type === Array) {
            var validators = field.validators;
            var minCount_1 = 0;
            var initialCount = field.form.initialCount || 0;
            validators.forEach(function (validator) {
                if (validator.validatorName === 'minCount')
                    minCount_1 = validator.param;
            });
            var item = {};
            if (type === Object) {
                var table = field.type[0];
                if (typeof field.type[0] === 'string') {
                    var schema = Schema_1.Schema.getInstance(table);
                    schema.clean(item);
                }
            }
            else {
                item = field.defaultValue;
            }
            var items = Math.max(minCount_1, initialCount);
            return new Array(items).fill(item);
        }
        else if (type === Object) {
            var item = {};
            var table = field.type;
            if (typeof table === 'string') {
                var schema = Schema_1.Schema.getInstance(table);
                schema.clean(item);
            }
            return item;
        }
        return field.defaultValue;
    };
    Bridge.prototype.getSubfields = function (name) {
        if (!name)
            return this.schema.keys;
        var field = this.getField(name);
        if (typeof field.type === 'string') {
            var schema = Schema_1.Schema.getInstance(field.type);
            return schema.keys;
        }
        else {
            return [];
        }
    };
    Bridge.prototype.findValidator = function (validatorName, field) {
        var def;
        if (typeof field === 'string') {
            def = this.getField(field);
        }
        else {
            def = field;
        }
        for (var _i = 0, _a = def.validators; _i < _a.length; _i++) {
            var validator = _a[_i];
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
            var transform = field.form.transform;
            var validatorIsAllowed = this.findValidator('isAllowed', field);
            var allowedValues = undefined;
            if (validatorIsAllowed)
                allowedValues = validatorIsAllowed.param;
            var required = !!this.findValidator('required', field);
            var uniforms = field.form, component = field.form.component;
            if (typeof uniforms === 'string' || typeof uniforms === 'function') {
                component = uniforms;
                uniforms = {};
            }
            var placeholder = void 0;
            if (props.placeholder === true && uniforms.placeholder) {
                placeholder = uniforms.placeholder;
            }
            else if (props.placeholder === false || props.placeholder === null) {
                placeholder = '';
            }
            var minCount_2 = 0;
            var maxCount_1 = 9999;
            field.validators.forEach(function (validator) {
                if (validator.validatorName === 'minCount')
                    minCount_2 = validator.param;
                if (validator.validatorName === 'maxCount')
                    maxCount_1 = validator.param;
            });
            this.fieldProps[name] = __assign({ label: field.label ? field.label : "", allowedValues: allowedValues,
                minCount: minCount_2,
                maxCount: maxCount_1,
                transform: transform,
                component: component,
                required: required,
                placeholder: placeholder }, uniforms);
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
    Bridge.prototype.getValidator = function (options) {
        var _this = this;
        return function (model) {
            var errors = _this.schema.validate(model);
            if (errors.length) {
                var error_1 = {};
                errors.forEach(function (e) {
                    error_1[e.path] = e.message;
                });
                throw __assign({}, error_1);
            }
        };
    };
    return Bridge;
}());
exports.Bridge = Bridge;
