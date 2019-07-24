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
// @ts-ignore
var lodash_mapvalues_1 = require("lodash.mapvalues");
var inflection = require("inflection");
var ValidatorCreator_1 = require("./ValidatorCreator");
var Validators_1 = require("./Validators");
var utils_1 = require("./utils");
var UniqueSchemaError_1 = require("../Errors/UniqueSchemaError");
var SchemaInstanceNotFound_1 = require("../Errors/SchemaInstanceNotFound");
var utils_2 = require("../utils");
var flat_1 = require("flat");
/**
 * Schema is the base of all components in Mandarina
 *
 * Form schemas mandarina is able to create:
 *
 * - Tables
 * - Form
 * - Lists
 *
 * Schemas are rigid and dynamic, maybe it is the biggest limitation of mandarina, you are no able to build a schema on the fly or programmatically.
 */
var Schema = /** @class */ (function () {
    function Schema(shape, options) {
        var _this = this;
        this.pathDefinitions = {};
        this.fieldsPermissions = {};
        var name = options.name, errorFromServerMapper = options.errorFromServerMapper, permissions = options.permissions;
        this.name = name;
        Schema.instances = Schema.instances || {};
        if (Schema.instances[this.name]) {
            throw new UniqueSchemaError_1.UniqueSchemaError(this.name);
        }
        Schema.instances[this.name] = this;
        this.errorFromServerMapper = errorFromServerMapper;
        this.permissions = permissions || {};
        this.shape = lodash_mapvalues_1.default(shape, function (field, key) { return _this.applyDefinitionsDefaults(field, key); });
        this.keys = Object.keys(this.shape);
        this.filePath = this.getFilePath();
        var single = utils_1.singularize(this.name);
        var singleUpper = utils_1.capitalize(single);
        var plural = utils_1.pluralize(this.name);
        var pluralUpper = utils_1.capitalize(plural);
        var connection = plural + "Connection";
        this.names = {
            // Example user, users, usersConnection
            query: { single: single, plural: plural, connection: connection },
            mutation: {
                create: "create" + singleUpper,
                update: "update" + singleUpper,
                delete: "delete" + singleUpper,
                updateMany: "updateMany" + pluralUpper,
                deleteMany: "deleteMany" + pluralUpper
            },
            orderBy: singleUpper + "OrderByInput",
            input: {
                where: {
                    single: singleUpper + "WhereUniqueInput!",
                    plural: singleUpper + "WhereInput",
                    connection: singleUpper + "WhereInput",
                },
                create: singleUpper + "CreateInput!",
                update: singleUpper + "UpdateInput!",
            }
        };
    }
    Schema.getInstance = function (name) {
        if (!Schema.instances[name]) {
            throw new SchemaInstanceNotFound_1.SchemaInstanceNotFound(name);
        }
        return Schema.instances[name];
    };
    Schema.prototype.extend = function (shape) {
        var _this = this;
        this.shape = __assign({}, this.shape, lodash_mapvalues_1.default(shape, function (def, key) { return _this.applyDefinitionsDefaults(def, key); }));
        this.keys = Object.keys(this.shape);
    };
    Schema.prototype.getPathDefinition = function (field) {
        if (!this.pathDefinitions[field]) {
            this.pathDefinitions[field] = this.generatePathDefinition(field);
        }
        var definition = this.pathDefinitions[field];
        if (!definition || Object.keys(definition).length === 0) {
            throw new Error("Field \"" + field + "\" not found");
        }
        return definition;
    };
    Schema.prototype.getFields = function () {
        var _this = this;
        if (this.fields)
            return this.fields;
        this.fields = this.keys.filter(function (field) { return !_this.getPathDefinition(field).isTable; });
        return this.fields;
    };
    Schema.prototype.getSubSchemas = function () {
        var _this = this;
        if (this.subSchemas)
            return this.subSchemas;
        this.subSchemas = this.keys.filter(function (field) { return _this.getPathDefinition(field).isTable; });
        return this.subSchemas;
    };
    Schema.prototype.clean = function (model, fields) {
        this.original = model;
        this._clean(model, fields);
    };
    Schema.prototype.getFilePath = function () {
        if (!this.filePath) {
            var origPrepareStackTrace = Error.prepareStackTrace;
            Error.prepareStackTrace = function (_, stack) {
                return stack;
            };
            var err = new Error();
            var stack = err.stack;
            Error.prepareStackTrace = origPrepareStackTrace;
            var path = require('path');
            // @ts-ignore
            if (!stack || !stack[2] || !stack[2].getFileName)
                return '';
            // @ts-ignore
            this.filePath = path.dirname(stack[2].getFileName());
        }
        return this.filePath;
    };
    Schema.prototype.validate = function (model, fields) {
        this.clean(model, fields);
        return this._validate(model, fields);
    };
    Schema.prototype.getSchemaPermission = function (roles, action) {
        if (!this.permissions)
            return true;
        for (var role in roles) {
            if (!this.permissions[action])
                return true;
            // @ts-ignore
            if (this.permissions[action].includes(role))
                return true;
        }
        return false;
    };
    Schema.prototype.getFieldPermission = function (field, roles, action) {
        var parentPath = field.split('.').shift();
        var def = this.getPathDefinition(field);
        var parentDef;
        if (parentPath) {
            parentDef = this.getPathDefinition(parentPath);
        }
        var parentRoles = parentDef && parentDef.permissions[action];
        var fieldRoles = def.permissions[action];
        var lappedRoles = parentRoles || fieldRoles;
        for (var _i = 0, roles_1 = roles; _i < roles_1.length; _i++) {
            var role = roles_1[_i];
            this.fieldsPermissions[field] = this.fieldsPermissions[field] || {};
            this.fieldsPermissions[field][role] = this.fieldsPermissions[field][role] || {};
            if (this.fieldsPermissions[field][role][action] === undefined) {
                this.fieldsPermissions[field][role][action] = !lappedRoles || ((lappedRoles.includes('everybody') || lappedRoles.includes(role)) &&
                    !lappedRoles.includes('nobody'));
            }
            console.log(field, lappedRoles, this.fieldsPermissions[field][role][action]);
            if (this.fieldsPermissions[field][role][action])
                return true;
        }
        return false;
    };
    Schema.prototype._getKeyDefinition = function (key) {
        return __assign({}, this.shape[key]);
    };
    /**
     * Mutate the model,with all keys  proper types and null for undefined
     * TODO: Refactor to prevent mutation, fix it creating a new cloned model and returning it
     * @param model
     * @param fields
     * @param removeExtraKeys
     */
    Schema.prototype._clean = function (model, fields, removeExtraKeys) {
        var _this = this;
        if (removeExtraKeys === void 0) { removeExtraKeys = true; }
        if (removeExtraKeys && model && typeof model === 'object') {
            Object.keys(model).forEach(function (key) {
                if (!_this.keys.includes(key)) {
                    delete model[key];
                }
            });
        }
        this.keys.forEach(function (key) {
            console.log('fields every', fields);
            if (key !== '___typename' && fields.every(function (field) { return field !== key && field.indexOf(key + '.') < 0; })) {
                return model && delete model[key];
            }
            var definition = _this.getPathDefinition(key);
            if (!definition.isTable && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = utils_1.forceType(model[key], definition.type);
                model[key] = model[key] === 0 ? 0 : model[key] || definition.defaultValue;
            }
            else if (definition.isTable && !definition.isArray && typeof model === 'object' && model !== undefined && model !== null) {
                if (model[key] !== 0 && !model[key]) {
                    return model[key] = definition.defaultValue;
                }
                var schema = Schema.getInstance(definition.type);
                schema._clean(model[key], utils_2.getDecendentsDot(fields, key));
                return;
            }
            else if (definition.isArray && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = utils_1.forceType(model[key], Array);
                if (definition.isTable) {
                    var schema_1 = Schema.getInstance(definition.type);
                    model[key] = model[key].map(function (value) {
                        schema_1._clean(value, utils_2.getDecendentsDot(fields, key));
                        return value;
                    });
                }
                else {
                    model[key] = model[key].map(function (value) { return utils_1.forceType(value, definition.type); });
                }
                return;
            }
            if (model) {
                model[key] = definition.transformValue.call({
                    model: _this.original,
                    siblings: model
                }, model[key]);
            }
        });
    };
    Schema.prototype.applyDefinitionsDefaults = function (definition, key) {
        var fieldDefinition = {};
        if (!definition.validators) {
            definition.validators = [];
        }
        //insert  type Validator on top
        fieldDefinition.validators = definition.validators.map(function (validator) {
            if (typeof validator === 'string') { //is is a string i found the Validator constructor in the instances
                return ValidatorCreator_1.ValidatorCreator.getInstance(validator).getValidatorWithParam(true);
            }
            else if (typeof validator === 'object') { //if is a object is because the only property is the instance validatorName and the value is the param to pass to getValidatorWithParam
                var name_1 = Object.keys(validator)[0];
                var param = validator[name_1];
                return ValidatorCreator_1.ValidatorCreator.getInstance(name_1).getValidatorWithParam(param);
            }
            return validator;
        });
        var isNumberValidator = Validators_1.isNumber.getValidatorWithParam();
        var isDateValidator = Validators_1.isDate.getValidatorWithParam();
        var isIntegerValidator = Validators_1.isInteger.getValidatorWithParam();
        var isStringValidator = Validators_1.isString.getValidatorWithParam();
        var isRequired = Validators_1.required.getValidatorWithParam();
        if (definition.type === Number && (!utils_1.hasValidator(fieldDefinition.validators, isNumberValidator.validatorName))) {
            fieldDefinition.validators.unshift(isNumberValidator);
        }
        if (definition.type === Date && (!utils_1.hasValidator(fieldDefinition.validators, isDateValidator.validatorName))) {
            fieldDefinition.validators.unshift(isDateValidator);
        }
        if (definition.type === Integer && (!utils_1.hasValidator(fieldDefinition.validators, isIntegerValidator.validatorName))) {
            fieldDefinition.validators.unshift(isIntegerValidator);
        }
        if (definition.type === String && (!utils_1.hasValidator(fieldDefinition.validators, isStringValidator.validatorName))) {
            fieldDefinition.validators.unshift(isStringValidator);
        }
        if (Array.isArray(definition.type) && typeof definition.type[0] !== 'string' && (!utils_1.hasValidator(fieldDefinition.validators, isRequired.validatorName))) {
            fieldDefinition.validators.unshift(isRequired);
        }
        // set default -> default values
        fieldDefinition.isArray = false;
        fieldDefinition.isTable = false;
        if (Array.isArray(definition.type)) {
            fieldDefinition.isArray = true;
            if (typeof definition.type[0] === 'string') {
                fieldDefinition.isTable = true;
                fieldDefinition.type = definition.type[0];
                fieldDefinition.defaultValue = definition.defaultValue || {};
            }
            else {
                fieldDefinition.type = definition.type[0];
                fieldDefinition.defaultValue = definition.defaultValue || null;
            }
        }
        else if ((typeof definition.type === 'string')) {
            fieldDefinition.isTable = true;
            fieldDefinition.type = definition.type;
            fieldDefinition.defaultValue = definition.defaultValue || {};
        }
        else {
            fieldDefinition.type = definition.type;
            fieldDefinition.defaultValue = definition.defaultValue === 0 ? 0 : definition.defaultValue || null;
        }
        definition.permissions = definition.permissions || this.permissions;
        fieldDefinition.permissions = definition.permissions;
        fieldDefinition.permissions.read = fieldDefinition.permissions.read || this.permissions.read;
        fieldDefinition.permissions.create = fieldDefinition.permissions.create || this.permissions.create;
        fieldDefinition.permissions.update = fieldDefinition.permissions.update || this.permissions.update;
        fieldDefinition.permissions.delete = fieldDefinition.permissions.delete || this.permissions.delete;
        fieldDefinition.form = definition.form || {};
        fieldDefinition.list = definition.list || {};
        fieldDefinition.table = definition.table || {};
        fieldDefinition.transformValue = definition.transformValue || (function (value) { return value; });
        if (typeof definition.label === 'string') {
            fieldDefinition.label = definition.label;
        }
        if (typeof definition.label === 'function') {
            fieldDefinition.label = definition.label(definition);
        }
        if (typeof fieldDefinition.label !== 'string') {
            fieldDefinition.label = inflection.transform(key, ['underscore', 'humanize']);
        }
        return fieldDefinition;
    };
    Schema.prototype.generatePathDefinition = function (key) {
        var paths = key.split('.');
        var schema = this;
        var def = schema._getKeyDefinition(paths[0]);
        paths.forEach(function (path) {
            if (!path.match(/\$|^\d+$/)) { //example user.0
                def = schema._getKeyDefinition(path);
                if (def.isTable) {
                    schema = Schema.getInstance(def.type);
                }
            }
        });
        return def;
    };
    Schema.prototype._validate = function (model, fields) {
        var _this = this;
        var errors = [];
        var flatModel = flat_1.flatten(model);
        Object.keys(flatModel).forEach(function (key) {
            var value = flatModel[key];
            var cleanKey = Schema.cleanKey(key);
            if (fields && !fields.includes(cleanKey))
                return;
            var last = cleanKey.split('.').pop();
            var definition = _this.getPathDefinition(cleanKey);
            for (var _i = 0, _a = definition.validators; _i < _a.length; _i++) {
                var validator = _a[_i];
                if (definition.isArray && !validator.arrayValidator)
                    continue;
                var instance = new validator({ key: last, path: key, definition: definition, value: value });
                var error = instance.validate(model);
                if (error) {
                    errors.push(error);
                }
            }
        });
        return errors;
    };
    Schema.cleanKey = function (key) { return key.replace(/\.\d+/g, ''); }; //clean key
    return Schema;
}());
exports.Schema = Schema;
function Integer() {
    return undefined;
}
exports.Integer = Integer;
(function (Integer) {
    Integer.type = 'Int';
})(Integer = exports.Integer || (exports.Integer = {}));
