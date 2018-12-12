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
var ValidatorCreator_1 = require("./ValidatorCreator");
// @ts-ignore
var lodash_mapvalues_1 = require("lodash.mapvalues");
var inflection = require("inflection");
var Validators_1 = require("./Validators");
var utils_1 = require("./utils");
var Schema = /** @class */ (function () {
    function Schema(shape, _a) {
        var name = _a.name, _b = _a.recursive, recursive = _b === void 0 ? [] : _b, _c = _a.forceType, forceType = _c === void 0 ? true : _c, _d = _a.virtual, virtual = _d === void 0 ? false : _d, errorFromServerMapper = _a.errorFromServerMapper, permissions = _a.permissions;
        var _this = this;
        this.pathDefinitions = {};
        this.arraysFields = [];
        this.name = name;
        Schema.instances = Schema.instances || [];
        if (Schema.instances[this.name])
            throw new Error("Schema named " + this.name + " already exists, names should be uniques");
        Schema.instances[this.name] = this;
        this.errorFromServerMapper = errorFromServerMapper;
        this.options = { recursive: recursive, forceType: forceType, virtual: virtual };
        this.permissions = permissions || {};
        this.shape = lodash_mapvalues_1.default(shape, function (field, key) { return _this.applyDefinitionsDefaults(field, key); });
        this.keys = Object.keys(this.shape);
    }
    Schema.getInstance = function (name) {
        var instance = Schema.instances[name];
        if (!instance)
            throw new Error("No Schema named " + name);
        return instance;
    };
    Schema.prototype.applyDefinitionsDefaults = function (definition, key) {
        var fieldDefinition = {};
        if (!definition.validators)
            definition.validators = [];
        //insert  type Validator on top
        fieldDefinition.validators = definition.validators.map(function (validator) {
            var constructor; // is a class constructor for Validator
            if (typeof validator === 'string') { //is is a string i found the Validator constructor in the instances
                constructor = ValidatorCreator_1.ValidatorCreator.getInstance(validator).getValidatorWithParam(true);
            }
            else if (typeof validator === 'object') { //if is a object is because the only property is the instance validatorName and the value is the param to pass to getValidatorWithParam
                var name_1 = Object.keys(validator)[0];
                var param = validator[name_1];
                constructor = ValidatorCreator_1.ValidatorCreator.getInstance(name_1).getValidatorWithParam(param);
            }
            else { // else is the constructor
                return validator;
            }
            return constructor;
        });
        var inNumberValidator = Validators_1.isNumber.getValidatorWithParam();
        var isDateValidator = Validators_1.isDate.getValidatorWithParam();
        var isIntegerValidator = Validators_1.isInteger.getValidatorWithParam();
        var isStringValidator = Validators_1.isString.getValidatorWithParam();
        if (definition.type === Number && (!utils_1.hasValidator(fieldDefinition.validators, inNumberValidator.validatorName)))
            definition.validators.unshift(inNumberValidator);
        if (definition.type === Date && (!utils_1.hasValidator(fieldDefinition.validators, isDateValidator.validatorName)))
            definition.validators.unshift(isDateValidator);
        if (definition.type === Integer && (!utils_1.hasValidator(fieldDefinition.validators, isIntegerValidator.validatorName)))
            definition.validators.unshift(isIntegerValidator);
        if (definition.type === String && (!utils_1.hasValidator(fieldDefinition.validators, isStringValidator.validatorName)))
            definition.validators.unshift(isStringValidator);
        // set default -> default values
        if (Array.isArray(definition.type)) {
            fieldDefinition.defaultValue = definition.defaultValue || [];
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
        fieldDefinition.unique = !!definition.unique;
        fieldDefinition.transformValue = definition.transformValue || (function (value) { return value; });
        if (typeof definition.label === 'string')
            fieldDefinition.label = definition.label;
        if (typeof definition.label === 'function')
            fieldDefinition.label = definition.label(definition);
        if (typeof fieldDefinition.label !== 'string')
            fieldDefinition.label = inflection.transform(key, ['underscore', 'humanize']);
        return fieldDefinition;
    };
    Schema.prototype.extend = function (shape) {
        var _this = this;
        this.shape = __assign({}, this.shape, lodash_mapvalues_1.default(shape, function (def, key) { return _this.applyDefinitionsDefaults(def, key); }));
        this.keys = Object.keys(this.shape);
    };
    Schema.prototype.getFieldDefinition = function (key) {
        return __assign({}, this.shape[key]);
    };
    /**
     *
     * @param permissions
     */
    Schema.prototype.inheritPermission = function (permissions) {
        return this;
        //todo this is has very bad performance for deep nested tables
        /*if (!permissions) return this
        const clone: Schema = cloneDeep(this)
        clone.permissions = permissions
        clone.shape = mapValues(clone.shape, (def, key) => clone.applyDefinitionsDefaults(def, key))

        clone.keys = Object.keys(clone.shape)
        return clone*/
    };
    Schema.prototype.getPathDefinition = function (key) {
        if (!this.pathDefinitions[key])
            this.pathDefinitions[key] = this._getPathDefinition(key);
        return this.pathDefinitions[key];
    };
    Schema.prototype._getPathDefinition = function (key) {
        var paths = key.split('.');
        var last = paths.length - 1;
        var schema = this, def = schema.getFieldDefinition(paths[0]);
        for (var i = 0; i <= last; i++) {
            if (!paths[i].match(/\$|^\d+$/)) { //example user.0
                def = schema.getFieldDefinition(paths[i]);
                if (typeof def.type === 'string')
                    schema = Schema.getInstance(def.type).inheritPermission(def.permissions);
                if (Array.isArray(def.type)) {
                    var tableName = def.type[0];
                    if (typeof tableName === 'string') {
                        schema = Schema.getInstance(tableName).inheritPermission(def.permissions);
                    }
                }
            }
            else {
                if (Array.isArray(def.type)) { //should be
                    def.type = def.type[0];
                    if (typeof def.type === 'string') {
                        schema = Schema.getInstance(def.type).inheritPermission(def.permissions);
                    }
                }
            }
        }
        return def;
    };
    Schema.prototype.validate = function (model) {
        return this._validate(model, '', [{ schema: this.name, path: '' }], model);
    };
    Schema.prototype.getFields = function () {
        if (this.fields)
            return this.fields;
        this.fields = this._getFields();
        return this.fields;
    };
    Schema.prototype.clean = function (model, transform) {
        if (transform === void 0) { transform = false; }
        this.original = model;
        this._clean(model, transform);
    };
    /**
     * mutate the model,with all keys  proper types and null for undefined
     * @param model
     * @param original
     * @param transform
     * @param removeExtraKeys
     */
    Schema.prototype._clean = function (model, transform, removeExtraKeys) {
        var _this = this;
        if (transform === void 0) { transform = false; }
        if (removeExtraKeys === void 0) { removeExtraKeys = true; }
        removeExtraKeys && model && typeof model === 'object' && Object.keys(model).forEach(function (key) { return !_this.keys.includes(key) && delete model[key]; });
        this.keys.forEach(function (key) {
            var definition = _this.getFieldDefinition(key);
            var type = definition.type;
            if (typeof type === "function" && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = utils_1.forceType(model[key], definition.type);
                model[key] = model[key] === 0 ? 0 : model[key] || definition.defaultValue;
            }
            else if (typeof type === "string" && typeof model === 'object' && model !== undefined && model !== null) {
                if (model[key] !== 0 && !model[key])
                    return model[key] = definition.defaultValue;
                var schema = Schema.getInstance(type);
                schema._clean(model[key], transform);
                return;
            }
            else if (Array.isArray(type) && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = utils_1.forceType(model[key], Array);
                if (typeof type[0] === 'string') {
                    var schema_1 = Schema.getInstance(type[0]);
                    model[key] = model[key].map(function (value) {
                        schema_1._clean(value, transform);
                        return value;
                    });
                }
                else {
                    model[key] = model[key].map(function (value) {
                        _this._clean(value, transform);
                        return value;
                    });
                }
                return;
            }
            if (transform && model)
                model[key] = definition.transformValue.call({
                    model: _this.original,
                    siblings: model
                }, model[key]);
        });
    };
    Schema.prototype._validate = function (model, parent, pathHistory, originalModel) {
        var _this = this;
        if (parent === void 0) { parent = ''; }
        if (pathHistory === void 0) { pathHistory = []; }
        var errors = [];
        var shape = __assign({}, model);
        this.keys.forEach(function (key) {
            delete shape[key];
            var path;
            var dot = parent ? '.' : '';
            path = "" + parent + dot + key;
            var definition = _this.getFieldDefinition(key);
            var value = model && model[key];
            var type = definition.type;
            if (typeof type === "string") {
                var schema = Schema.getInstance(type);
                var schemaName_1 = schema.name;
                var internalErrors = [];
                //check if we are entering in a recursive table, if actual table has been used before, reviewing the history
                if (!pathHistory.some(function (_a) {
                    var schema = _a.schema, path = _a.path;
                    return schemaName_1 === schema;
                }))
                    internalErrors = schema._validate(value, path, pathHistory, originalModel);
                pathHistory.push({ path: path, schema: schemaName_1 });
                return errors = errors.concat(internalErrors);
            }
            if (Array.isArray(type)) {
                // const Validator = isArray.getValidatorWithParam()
                // const error = new Validator({key, path, definition, value}).validate(originalModel)
                //if (error) return errors = errors.concat(error)
                if (typeof type[0] === 'string' && value) { //todo tal vez es mejor chquear en default value que siempre tenga un valor
                    var schema_2 = Schema.getInstance(type[0]);
                    var schemaName_2 = schema_2.name;
                    var internalErrors_1 = [];
                    value.forEach(function (value, i) {
                        if (!pathHistory.some(function (_a) {
                            var schema = _a.schema, path = _a.path;
                            return schemaName_2 === schema;
                        }))
                            internalErrors_1 = internalErrors_1.concat(schema_2._validate(value, path + "." + i, pathHistory, originalModel));
                        pathHistory.push({ path: path, schema: schemaName_2 });
                    });
                    errors = errors.concat(internalErrors_1);
                }
                else if (value) { //todo es mejor chquear en default value que siempre tenga un valor
                    value.forEach(function (value, i) {
                        for (var _i = 0, _a = definition.validators; _i < _a.length; _i++) {
                            var validator = _a[_i];
                            var instance = new validator({ key: key, path: path, definition: definition, value: value });
                            var error = instance.validate(originalModel);
                            if (error)
                                return errors.push(error);
                        }
                    });
                }
                return errors;
            }
            for (var _i = 0, _a = definition.validators; _i < _a.length; _i++) {
                var validator = _a[_i];
                var instance = new validator({ key: key, path: path, definition: definition, value: value });
                var error = instance.validate(originalModel);
                if (error)
                    return errors.push(error);
            }
        });
        var extraKeys = Object.keys(shape);
        if (extraKeys.length)
            errors = errors.concat(extraKeys.map(function (key) {
                var Validator = Validators_1.extraKey.getValidatorWithParam();
                var definition = _this.applyDefinitionsDefaults({ label: key, type: String }, key); //mock definition for a not existent key
                return new Validator({
                    key: key,
                    definition: definition,
                    path: parent,
                    value: key
                }).validate(originalModel);
            }));
        return errors;
    };
    Schema.prototype._getFields = function (parent, pathHistory) {
        var _this = this;
        if (parent === void 0) { parent = ''; }
        if (pathHistory === void 0) { pathHistory = []; }
        var fields = [];
        var schema = this;
        schema.keys.forEach(function (key) {
            var path;
            var dot = parent ? '.' : '';
            path = "" + parent + dot + key;
            var def = schema.getFieldDefinition(key);
            var table;
            if (typeof def.type === 'string')
                table = Schema.getInstance(def.type);
            if (Array.isArray(def.type)) {
                _this.arraysFields.push(path);
                if (typeof def.type[0] === 'string')
                    table = Schema.getInstance(def.type[0]);
            }
            if (table) {
                pathHistory.push({ path: path, table: _this.name });
                var fieldsInternal = [];
                var tableName_1 = table.name;
                //check if we are entering in a recursive table, if actual table has been used before, reviewing the history
                if (!pathHistory.some(function (_a) {
                    var table = _a.table;
                    return tableName_1 === table;
                })) {
                    fieldsInternal = table._getFields(path, pathHistory);
                }
                //to intro a path in table options to continue deep in get fields
                fields = fields.concat(fieldsInternal);
            }
            else {
                fields.push(path);
            }
        });
        return fields;
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
