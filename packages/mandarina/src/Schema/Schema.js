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
var getDefaultPermissions = function () { return ({ read: {}, create: {}, update: {}, delete: {} }); };
var defaultActions = Object.keys(getDefaultPermissions());
var Schema = /** @class */ (function () {
    function Schema(shape, options) {
        var _this = this;
        this.arraysFields = [];
        this.pathDefinitions = {};
        this._isConnectingTable = function (value) {
            return (value && value.hasOwnProperty && value.hasOwnProperty('id') && typeof value.id === 'string');
        };
        var name = options.name, _a = options.recursive, recursive = _a === void 0 ? [] : _a, errorFromServerMapper = options.errorFromServerMapper, permissions = options.permissions;
        this.name = name;
        Schema.instances = Schema.instances || {};
        if (Schema.instances[this.name]) {
            throw new UniqueSchemaError_1.UniqueSchemaError(this.name);
        }
        Schema.instances[this.name] = this;
        this.errorFromServerMapper = errorFromServerMapper;
        this.options = { recursive: recursive };
        this.permissions = permissions || {};
        this.shape = lodash_mapvalues_1.default(shape, function (field, key) { return _this.applyDefinitionsDefaults(field, key); });
        this.keys = Object.keys(this.shape);
        //if (!this.keys.includes('id')) this.extend({id: {type:String}})
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
    Schema.prototype.getFieldDefinition = function (key) {
        return __assign({}, this.shape[key]);
    };
    Schema.prototype.getPathDefinition = function (key) {
        if (!this.pathDefinitions[key]) {
            this.pathDefinitions[key] = this.generatePathDefinition(key);
        }
        return this.pathDefinitions[key];
    };
    Schema.prototype.getFields = function () {
        if (!this.fields) {
            this.fields = this._getFields();
        }
        return this.fields;
    };
    Schema.prototype.clean = function (model, fields) {
        if (fields === void 0) { fields = this.getFields(); }
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
        if (fields === void 0) { fields = this.getFields(); }
        this.clean(model, fields);
        return this._validate(model, '', [{ schema: this.name, path: '' }], model);
    };
    /**
     * Mutate the model,with all keys  proper types and null for undefined
     * TODO: Refactor to prevent mutation, fix it creating a new cloned model and returning it
     * @param model
     * @param transform
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
            if (key !== '___typename' && fields.every(function (field) { return field !== key && field.indexOf(key + '.') < 0; })) {
                return model && delete model[key];
            }
            var definition = _this.getFieldDefinition(key);
            var type = definition.type;
            if (typeof type === "function" && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = utils_1.forceType(model[key], definition.type);
                model[key] = model[key] === 0 ? 0 : model[key] || definition.defaultValue;
            }
            else if (typeof type === "string" && typeof model === 'object' && model !== undefined && model !== null) {
                if (model[key] !== 0 && !model[key]) {
                    return model[key] = definition.defaultValue;
                }
                var schema = Schema.getInstance(type);
                schema._clean(model[key], utils_2.getDecendents(fields, key));
                return;
            }
            else if (Array.isArray(type) && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = utils_1.forceType(model[key], Array);
                if (typeof type[0] === 'string') {
                    var schema_1 = Schema.getInstance(type[0]);
                    model[key] = model[key].map(function (value) {
                        schema_1._clean(value, utils_2.getDecendents(fields, key));
                        return value;
                    });
                }
                else {
                    model[key] = model[key].map(function (value) { return utils_1.forceType(value, type[0]); });
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
        if (Array.isArray(definition.type)) {
            if (typeof definition.type[0] === 'string') {
                fieldDefinition.defaultValue = definition.defaultValue || {};
            }
            else {
                fieldDefinition.defaultValue = definition.defaultValue || null;
            }
        }
        else if (typeof definition.type === 'string') {
            fieldDefinition.defaultValue = definition.defaultValue || {};
        }
        else {
            fieldDefinition.defaultValue = definition.defaultValue === 0 ? 0 : definition.defaultValue || null;
        }
        fieldDefinition.type = definition.type;
        definition.permissions = definition.permissions || this.permissions;
        fieldDefinition.permissions = definition.permissions;
        fieldDefinition.permissions.read = fieldDefinition.permissions.read || this.permissions.read;
        fieldDefinition.permissions.create = fieldDefinition.permissions.create || this.permissions.create;
        fieldDefinition.permissions.update = fieldDefinition.permissions.update || this.permissions.update;
        fieldDefinition.permissions.delete = fieldDefinition.permissions.delete || this.permissions.delete;
        fieldDefinition.type = definition.type;
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
        var def = schema.getFieldDefinition(paths[0]);
        paths.forEach(function (path) {
            if (!path.match(/\$|^\d+$/)) { //example user.0
                def = schema.getFieldDefinition(path);
                if (typeof def.type === 'string') {
                    schema = Schema.getInstance(def.type);
                }
                if (Array.isArray(def.type)) {
                    var tableName = def.type[0];
                    if (typeof tableName === 'string') {
                        schema = Schema.getInstance(tableName);
                    }
                }
            }
            else if (Array.isArray(def.type)) { //should be
                def.type = def.type[0];
                if (typeof def.type === 'string') {
                    schema = Schema.getInstance(def.type);
                }
            }
        });
        return def;
    };
    Schema.prototype._validate = function (model, parent, pathHistory, originalModel) {
        var _this = this;
        if (parent === void 0) { parent = ''; }
        if (pathHistory === void 0) { pathHistory = []; }
        var errors = [];
        var shape = __assign({}, model);
        this.keys.forEach(function (key) {
            delete shape[key];
            var dot = parent ? '.' : '';
            var path = "" + parent + dot + key;
            var definition = _this.getFieldDefinition(key);
            var value = model && model[key];
            var type = definition.type;
            if (typeof type === "string") {
                var schema = Schema.getInstance(type);
                var schemaName_1 = schema.name;
                var internalErrors = [];
                // Check if we are entering in a recursive table, if actual table has been used before, reviewing the history
                if (!pathHistory.some(function (_a) {
                    var schema = _a.schema, path = _a.path;
                    return schemaName_1 === schema;
                }) && !_this._isConnectingTable(value)) {
                    internalErrors = schema._validate(value, path, pathHistory, originalModel);
                }
                pathHistory.push({ path: path, schema: schemaName_1 });
                return errors = errors.concat(internalErrors);
            }
            if (Array.isArray(type)) {
                //check arrayValidators (min array count for example)
                for (var _i = 0, _a = definition.validators; _i < _a.length; _i++) {
                    var validator = _a[_i];
                    if (!validator.arrayValidator)
                        continue;
                    var instance = new validator({ key: key, path: path, definition: definition, value: value });
                    var error = instance.validate(originalModel);
                    if (error) {
                        return errors.push(error);
                    }
                }
                //Check no array validators
                // TODO: Tal vez es mejor chequear en default value que siempre tenga un valor
                if (typeof type[0] === 'string' && value) {
                    var schema_2 = Schema.getInstance(type[0]);
                    var schemaName_2 = schema_2.name;
                    var internalErrors_1 = [];
                    value.forEach(function (value, i) {
                        if (!pathHistory.some(function (_a) {
                            var schema = _a.schema, path = _a.path;
                            return schemaName_2 === schema;
                        }) && !_this._isConnectingTable(value)) {
                            internalErrors_1 = internalErrors_1.concat(schema_2._validate(value, path + "." + i, pathHistory, originalModel));
                        }
                        pathHistory.push({ path: path, schema: schemaName_2 });
                    });
                    errors = errors.concat(internalErrors_1);
                }
                else if (value) {
                    // TODO: Es mejor chquear en default value que siempre tenga un valor
                    value.forEach(function (value, i) {
                        for (var _i = 0, _a = definition.validators; _i < _a.length; _i++) {
                            var validator = _a[_i];
                            if (validator.arrayValidator)
                                continue;
                            var instance = new validator({ key: key, path: path, definition: definition, value: value });
                            var error = instance.validate(originalModel);
                            if (error) {
                                ;
                                return errors.push(error);
                            }
                        }
                    });
                }
                return errors;
            }
            for (var _b = 0, _c = definition.validators; _b < _c.length; _b++) {
                var validator = _c[_b];
                if (validator.arrayValidator)
                    continue;
                var instance = new validator({ key: key, path: path, definition: definition, value: value });
                var error = instance.validate(originalModel);
                if (error) {
                    return errors.push(error);
                }
            }
        });
        var extraKeys = Object.keys(shape);
        if (extraKeys.length) {
            extraKeys.forEach(function (key) {
                if (key === 'id')
                    return;
                var Validator = Validators_1.extraKey.getValidatorWithParam();
                // Mock definition for a not existent key
                var definition = _this.applyDefinitionsDefaults({ label: key, type: String }, key);
                errors.push(new Validator({
                    key: key,
                    definition: definition,
                    path: parent,
                    value: key
                }).validate(originalModel));
            });
        }
        return errors;
    };
    Schema.prototype._getFields = function (parent, pathHistory) {
        var _this = this;
        if (parent === void 0) { parent = ''; }
        if (pathHistory === void 0) { pathHistory = []; }
        var fields = [];
        var schema = this;
        schema.keys.forEach(function (key) {
            var dot = parent ? '.' : '';
            var path = "" + parent + dot + key;
            var def = schema.getFieldDefinition(key);
            var table;
            if (typeof def.type === 'string') {
                table = Schema.getInstance(def.type);
            }
            if (Array.isArray(def.type)) {
                _this.arraysFields.push(path);
                if (typeof def.type[0] === 'string') {
                    table = Schema.getInstance(def.type[0]);
                }
            }
            if (table) {
                pathHistory.push({ path: path, table: _this.name });
                var fieldsInternal = [];
                var tableName_1 = table.name;
                // Check if we are entering in a recursive table, if actual table has been used before, reviewing the history
                if (!pathHistory.some(function (_a) {
                    var table = _a.table;
                    return tableName_1 === table;
                })) {
                    fieldsInternal = table._getFields(path, pathHistory);
                }
                // To intro a path in table options to continue deep in get fields
                fields = fields.concat(fieldsInternal);
            }
            else {
                fields.push(path);
            }
        });
        return fields;
    };
    /**
     * Returns the the authorization schema definition for the instance
     *
     * @return Permissions
     */
    Schema.prototype.getPermissions = function () {
        var _this = this;
        var fields = this.getFields();
        if (!this.rolePermissions) {
            this.rolePermissions = getDefaultPermissions();
            fields.forEach(function (field) {
                var def = _this.getPathDefinition(field);
                var parentPath = field.split('.').shift();
                var parentDef;
                if (parentPath) {
                    parentDef = _this.getPathDefinition(parentPath);
                }
                defaultActions.forEach(function (action) {
                    var parentRoles = parentDef && parentDef.permissions[action];
                    var roles = def.permissions[action];
                    if ((parentRoles && parentRoles.includes('nobody')) || (roles && roles.includes('nobody'))) { // if the first parent has nobody the there no permission for any children
                        return;
                    }
                    if (!roles && !parentRoles) {
                        _this.rolePermissions[action].everyone = _this.rolePermissions[action].everyone || [];
                        _this.rolePermissions[action].everyone.push(field);
                        return;
                    }
                    else if (roles) {
                        roles.forEach(function (role) {
                            if (parentRoles && parentRoles.includes(role)) {
                                _this.rolePermissions[action][role] = _this.rolePermissions[action][role] || [];
                                _this.rolePermissions[action][role].push(field);
                            }
                            else {
                                _this.rolePermissions[action][role] = _this.rolePermissions[action][role] || [];
                                _this.rolePermissions[action][role].push(field);
                            }
                        });
                    }
                });
            });
        }
        return this.rolePermissions;
    };
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
