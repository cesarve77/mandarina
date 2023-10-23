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
exports.Integer = exports.Schema = void 0;
var lodash_1 = require("lodash");
var inflection = __importStar(require("inflection"));
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
        this.indexes = [];
        this.pathDefinitions = {};
        this.validateQuery = function (fields, roles) {
            for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
                var field = fields_1[_i];
                if (!_this.getFieldPermission(field, 'read', roles)) {
                    console.error(_this.name, _this.getPathDefinition(field), roles);
                    throw new Error("401.1, You are not allowed to read \"".concat(field, "\" on ").concat(_this.name));
                }
            }
        };
        this.validateConnection = function (roles) {
            if (!_this.getSchemaPermission(roles, 'read')) {
                console.log(_this.name, _this.permissions, roles);
                throw new Error("401.2, You are not allowed to read on ".concat(_this.name));
            }
        };
        this.validateMutation = function (action, mutation, roles) {
            if (!Array.isArray(mutation))
                mutation = [mutation];
            for (var _i = 0, mutation_1 = mutation; _i < mutation_1.length; _i++) {
                var m = mutation_1[_i];
                var data = m.data || m.create;
                if (!data)
                    continue;
                var fields = Object.keys(data);
                for (var _a = 0, fields_2 = fields; _a < fields_2.length; _a++) {
                    var field = fields_2[_a];
                    var def = _this.getPathDefinition(field);
                    var inline = !!(def.table && def.table.relation && def.table.relation.link === 'INLINE');
                    if (def.isTable) {
                        var schema = Schema.getInstance(def.type);
                        var operations = Object.keys(data[field]);
                        for (var _b = 0, operations_1 = operations; _b < operations_1.length; _b++) {
                            var operation = operations_1[_b];
                            if (operation === 'set' || operation === 'connect') {
                                var allowed = schema.getFieldPermission('id', action, roles);
                                if (!allowed)
                                    throw new Error("401.3, You are not allowed to ".concat(operation, " \"").concat(field, ".id\" on ").concat(_this.name));
                                continue;
                            }
                            var args2 = data[field][operation];
                            if (!Array.isArray(args2))
                                args2 = [args2];
                            if (operation !== 'upsert') {
                                for (var _c = 0, args2_1 = args2; _c < args2_1.length; _c++) {
                                    var arg2 = args2_1[_c];
                                    if (inline || operation !== 'update')
                                        arg2 = { data: arg2 };
                                    schema.validateMutation(action, arg2, roles);
                                }
                            }
                            else {
                                for (var _d = 0, args2_2 = args2; _d < args2_2.length; _d++) {
                                    var arg2 = args2_2[_d];
                                    schema.validateMutation('update', { data: arg2.update }, roles);
                                    schema.validateMutation('create', { data: arg2.create }, roles);
                                }
                            }
                        }
                    }
                    else {
                        var allowed = _this.getFieldPermission(field, action, roles);
                        if (!allowed)
                            throw new Error("401.4, You are not allowed to ".concat(action, " \"").concat(field, "\" on ").concat(_this.name, "."));
                    }
                }
            }
        };
        var name = options.name, errorFromServerMapper = options.errorFromServerMapper, permissions = options.permissions, indexes = options.indexes;
        this.name = name;
        Schema.instances = Schema.instances || {};
        if (Schema.instances[this.name]) {
            throw new UniqueSchemaError_1.UniqueSchemaError(this.name);
        }
        Schema.instances[this.name] = this;
        this.errorFromServerMapper = errorFromServerMapper;
        this.indexes = (indexes || []);
        this.permissions = permissions || {};
        this.shape = (0, lodash_1.mapValues)(shape, function (field, key) { return _this.applyDefinitionsDefaults(field, key); });
        this.keys = Object.keys(this.shape);
        this.filePath = this.getFilePath();
        var single = (0, utils_1.singularize)(this.name);
        var singleUpper = (0, utils_1.capitalize)(single);
        var plural = (0, utils_1.pluralize)(this.name);
        var pluralUpper = (0, utils_1.capitalize)(plural);
        var connection = "".concat(plural, "Connection");
        this.names = {
            // Example user, users, usersConnection
            query: { single: single, plural: plural, connection: connection },
            mutation: {
                create: "create".concat(singleUpper),
                update: "update".concat(singleUpper),
                delete: "delete".concat(singleUpper),
                updateMany: "updateMany".concat(pluralUpper),
                deleteMany: "deleteMany".concat(pluralUpper)
            },
            orderBy: "".concat(singleUpper, "OrderByInput"),
            input: {
                where: {
                    single: "".concat(singleUpper, "WhereUniqueInput!"),
                    plural: "".concat(singleUpper, "WhereInput"),
                    connection: "".concat(singleUpper, "WhereInput"),
                },
                create: "".concat(singleUpper, "CreateInput!"),
                update: "".concat(singleUpper, "UpdateInput!"),
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
        this.shape = __assign(__assign({}, this.shape), (0, lodash_1.mapValues)(shape, function (def, key) { return _this.applyDefinitionsDefaults(def, key); }));
        this.keys = Object.keys(this.shape);
    };
    Schema.prototype.hasPath = function (field) {
        var definition = this._getPathDefinition(field);
        return !(!definition || Object.keys(definition).length === 0);
    };
    Schema.prototype.getPathDefinition = function (field, overwrite) {
        var definition = this._getPathDefinition(field, overwrite);
        if (!definition) {
            throw new Error("Field \"".concat(field, "\" not found in ").concat(this.name));
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
    Schema.prototype.validate = function (model, fields, overwrite) {
        fields = (0, utils_2.insertParents)(fields);
        this.clean(model, fields);
        return this._validate(model, fields, overwrite);
    };
    Schema.prototype.getSchemaPermission = function (roles, action) {
        if (roles === void 0) { roles = []; }
        if (!this.permissions[action])
            return true;
        var rolesWithEverybody = __spreadArray(__spreadArray([], roles, true), ['everybody'], false);
        for (var _i = 0, rolesWithEverybody_1 = rolesWithEverybody; _i < rolesWithEverybody_1.length; _i++) {
            var role = rolesWithEverybody_1[_i];
            // @ts-ignore
            if (this.permissions[action].includes(role))
                return true;
        }
        return false;
    };
    Schema.prototype.getFieldPermission = function (field, action, roles) {
        var rolesWithEverybody = __spreadArray(__spreadArray([], (roles || []), true), ['everybody'], false);
        // let parentPath = field
        // let lastDot = parentPath.lastIndexOf('.')
        // let parentRoles: string[] = []
        // while (lastDot >= 0) {
        //     parentPath = parentPath.substring(0, lastDot)
        //     lastDot = parentPath.lastIndexOf('.')
        //     console.log('parentPath', parentPath)
        //     console.log('lastDot', lastDot)
        //     if (parentPath) {
        //         const parentDef = this.getPathDefinition(parentPath)
        //         const parentPermissions = parentDef.permissions[action]
        //         if (parentPermissions) parentRoles.concat(parentPermissions)
        //     }
        // }
        var def = this.getPathDefinition(field);
        if (def.isTable && action === 'read')
            return true; //prove only final fields
        if (!def.permissions) {
            console.error('!def.permissions getFieldPermission field2 ', this.name, field, action);
        }
        var fieldRoles = def.permissions[action] || [];
        // const lappedRoles = [...fieldRoles, ...parentRoles]
        return fieldRoles.some(function (role) { return rolesWithEverybody.includes(role); });
    };
    Schema.prototype._getKeyDefinition = function (key) {
        return __assign({}, this.shape[key]);
    };
    Schema.prototype.applyDefinitionsDefaults = function (definition, key) {
        var _this = this;
        var fieldDefinition = {};
        fieldDefinition.key = key;
        //insert  type Validator on top
        fieldDefinition.validators = Schema.mapValidators(definition.validators || []);
        var isNumberValidator = Validators_1.isNumber.getValidatorWithParam();
        var isDateValidator = Validators_1.isDate.getValidatorWithParam();
        var isIntegerValidator = Validators_1.isInteger.getValidatorWithParam();
        var isStringValidator = Validators_1.isString.getValidatorWithParam();
        // const isRequired = required.getValidatorWithParam();
        if (definition.type === Number && (!(0, utils_1.hasValidator)(fieldDefinition.validators, isNumberValidator.validatorName))) {
            fieldDefinition.validators.unshift(isNumberValidator);
        }
        if (definition.type === Date && (!(0, utils_1.hasValidator)(fieldDefinition.validators, isDateValidator.validatorName))) {
            fieldDefinition.validators.unshift(isDateValidator);
        }
        if (definition.type === Integer && (!(0, utils_1.hasValidator)(fieldDefinition.validators, isIntegerValidator.validatorName))) {
            fieldDefinition.validators.unshift(isIntegerValidator);
        }
        if (definition.type === String && (!(0, utils_1.hasValidator)(fieldDefinition.validators, isStringValidator.validatorName))) {
            fieldDefinition.validators.unshift(isStringValidator);
        }
        // if (Array.isArray(definition.type) && typeof definition.type[0] !== 'string' && (!hasValidator(fieldDefinition.validators, isRequired.validatorName))) {
        //     fieldDefinition.validators.unshift(isRequired);
        // }
        // set default -> default values
        fieldDefinition.isArray = false;
        fieldDefinition.isTable = false;
        if (Array.isArray(definition.type)) {
            fieldDefinition.isArray = true;
            if (typeof definition.type[0] === 'string') {
                fieldDefinition.isTable = true;
                fieldDefinition.type = definition.type[0];
                fieldDefinition.defaultValue = definition.defaultValue || [];
                fieldDefinition.validators.forEach(function (_a) {
                    var tableValidator = _a.tableValidator, arrayValidator = _a.arrayValidator, validatorName = _a.validatorName;
                    if (!tableValidator && !arrayValidator) {
                        throw new Error("Field \"".concat(key, "\" in schema \"").concat(_this.name, "\" only accept validator of type Table or Array and has validator \"").concat(validatorName, "\""));
                    }
                });
            }
            else {
                fieldDefinition.type = definition.type[0];
                fieldDefinition.defaultValue = definition.defaultValue || null;
                fieldDefinition.validators.forEach(function (_a) {
                    var tableValidator = _a.tableValidator, validatorName = _a.validatorName;
                    if (tableValidator) {
                        throw new Error("Field \"".concat(key, "\" in schema \"").concat(_this.name, "\" only accept validator of type array or scalar and has validator \"").concat(validatorName, "\""));
                    }
                });
            }
        }
        else if ((typeof definition.type === 'string')) {
            fieldDefinition.isTable = true;
            fieldDefinition.type = definition.type;
            fieldDefinition.defaultValue = definition.defaultValue || {};
            fieldDefinition.validators.forEach(function (_a) {
                var tableValidator = _a.tableValidator, validatorName = _a.validatorName;
                if (!tableValidator) {
                    throw new Error("Field \"".concat(key, "\" in schema \"").concat(_this.name, "\" only accept validator of type Table and has validator \"").concat(validatorName, "\""));
                }
            });
        }
        else {
            fieldDefinition.type = definition.type;
            fieldDefinition.defaultValue = definition.defaultValue === 0 ? 0 : definition.defaultValue || null;
            fieldDefinition.validators.forEach(function (_a) {
                var tableValidator = _a.tableValidator, arrayValidator = _a.arrayValidator, validatorName = _a.validatorName;
                if (tableValidator || arrayValidator) {
                    throw new Error("Field \"".concat(key, "\" in schema \"").concat(_this.name, "\" only accept validator of type scalar and has validator \"").concat(validatorName, "\""));
                }
            });
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
            fieldDefinition.label = inflection.transform(key, ['underscore', 'humanize', 'titleize']);
        }
        return fieldDefinition;
    };
    /**
     * Mutate the model,with all keys  proper types and null for undefined
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
            if (key !== '___typename' && fields.every(function (field) { return field !== key && field.indexOf(key + '.') < 0; })) {
                return model && delete model[key];
            }
            var definition = _this.getPathDefinition(key);
            if (!definition.isTable && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = (0, utils_1.forceType)(model[key], definition.type);
                model[key] = model[key] === undefined || model[key] === null ? definition.defaultValue : model[key];
            }
            else if (definition.isTable && !definition.isArray && typeof model === 'object' && model !== undefined && model !== null) {
                if (model[key] === null || model[key] === undefined) {
                    model[key] = definition.defaultValue;
                }
                var schema = Schema.getInstance(definition.type);
                schema._clean(model[key], (0, utils_2.getDecendentsDot)(fields, key));
                return;
            }
            else if (definition.isArray && typeof model === 'object' && model !== undefined && model !== null) {
                model[key] = (0, utils_1.forceType)(model[key], Array);
                if (definition.isTable) {
                    var schema_1 = Schema.getInstance(definition.type);
                    model[key] = model[key] && model[key].map(function (value) {
                        schema_1._clean(value, (0, utils_2.getDecendentsDot)(fields, key));
                        return value;
                    });
                }
                else {
                    model[key] = model[key] && model[key].map(function (value) { return (0, utils_1.forceType)(value, definition.type); });
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
    Schema.prototype._getPathDefinition = function (field, overwrite) {
        if (!this.pathDefinitions[field]) {
            this.pathDefinitions[field] = this.generatePathDefinition(field);
        }
        if (overwrite && overwrite.validators) {
            overwrite.validators = Schema.mapValidators(overwrite.validators);
        }
        return overwrite ? (0, lodash_1.merge)((0, lodash_1.cloneDeep)(this.pathDefinitions[field]), overwrite) : this.pathDefinitions[field];
    };
    Schema.prototype.getChainedLabel = function (key) {
        var paths = key.split('.');
        var schema = this;
        var labels = [];
        var def = schema._getKeyDefinition(paths[0]);
        paths.forEach(function (path) {
            if (!path.match(/\$|^\d+$/)) { //example user.0
                def = schema._getKeyDefinition(path);
                if (def.isTable) {
                    schema = Schema.getInstance(def.type);
                }
                if (def.label) {
                    labels.push(def.label);
                }
            }
            else {
                labels.push("(".concat(path, ")"));
            }
        });
        return labels.join(' -> ');
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
    Schema.prototype._validate = function (model, fields, overwrite) {
        var _this = this;
        var errors = [];
        var flatModel = (0, flat_1.flatten)(model);
        var flatModelKeys = (0, utils_2.insertParents)(Object.keys(flatModel));
        flatModelKeys.forEach(function (key) {
            var value = (0, lodash_1.get)(model, key);
            var cleanKey = Schema.cleanKey(key);
            if (fields && !fields.includes(cleanKey))
                return;
            var last = cleanKey.split('.').pop();
            var definition = _this.getPathDefinition(cleanKey, overwrite && overwrite[cleanKey]);
            for (var _i = 0, _a = definition.validators; _i < _a.length; _i++) {
                var validator = _a[_i];
                var isScalar = key.match(/\.\d+$/);
                if (definition.isTable && validator.tableValidator &&
                    isScalar //if is a scalar like user.0
                ) {
                    continue;
                }
                if (definition.isTable && !validator.tableValidator) {
                    continue;
                }
                if (definition.isArray && validator.tableValidator) {
                    continue;
                }
                if (definition.isArray &&
                    !validator.arrayValidator && !isScalar) {
                    continue;
                }
                if (definition.isArray &&
                    validator.arrayValidator &&
                    isScalar //if is a scalar like user.0
                ) {
                    continue;
                }
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
    Schema.mapValidators = function (validators) { return validators.map(function (validator) {
        if (typeof validator === 'string') { //is is a string i found the Validator constructor in the instances
            return ValidatorCreator_1.ValidatorCreator.getInstance(validator).getValidatorWithParam(true);
        }
        else if (typeof validator === 'object') { //if is a object is because the only property is the instance validatorName and the value is the param to pass to getValidatorWithParam
            var name_1 = Object.keys(validator)[0];
            var param = validator[name_1];
            return ValidatorCreator_1.ValidatorCreator.getInstance(name_1).getValidatorWithParam(param);
        }
        return validator;
    }); };
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
//# sourceMappingURL=Schema.js.map