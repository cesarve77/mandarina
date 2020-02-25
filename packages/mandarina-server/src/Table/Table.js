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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mandarina_1 = require("mandarina");
var UniqueSchemaError_1 = require("mandarina/build/Errors/UniqueSchemaError");
var SchemaInstanceNotFound_1 = require("mandarina/build/Errors/SchemaInstanceNotFound");
var utils_1 = require("mandarina/build/Schema/utils");
var MissingIDTableError_1 = require("mandarina/build/Errors/MissingIDTableError");
var Mandarina_1 = require("../Mandarina");
var Mutate_1 = require("mandarina/build/Operations/Mutate");
var language_1 = require("graphql/language");
var stringify_object_1 = require("stringify-object");
var lodash_1 = require("lodash");
// import {flatten, unflatten} from "flat";
/**
 *
 * A Table instance is the representation of the one of several of the followings:
 * Physic table in the data base
 * Form
 * List of results
 */
var Table = /** @class */ (function () {
    function Table(schema, tableOptions) {
        var _this = this;
        this.insertWhereIntoInfo = function (info, user, isSingleMutation) {
            if (isSingleMutation === void 0) { isSingleMutation = false; }
            var field = [];
            var fields = new Set();
            var required = false;
            var query = language_1.visit(info.operation, {
                enter: function (node, key, parent, path, ancestors) {
                    if (node.kind === 'Field' && node.name.value !== '__typename') {
                        field.push(node.name.value);
                        var internalField = field.slice(1).join('.');
                        var table = void 0;
                        if (internalField) {
                            fields.add(internalField);
                            var def = _this.schema.getPathDefinition(internalField);
                            if (def.isTable && def.isArray) {
                                table = Table.instances[def.type];
                            }
                        }
                        else {
                            table = _this;
                        }
                        if (table && table.options.where && (!isSingleMutation && table === _this)) {
                            var where = table.options.where(user);
                            if (!where || lodash_1.isEmpty(where))
                                return;
                            var clone = Mutate_1.deepClone(node);
                            var originalWhereObj = clone.arguments ? clone.arguments.find(function (a) { return a.name.value === 'where'; }) : null;
                            var originalWhereString = '';
                            if (originalWhereObj && table === _this) {
                                originalWhereString = language_1.print(originalWhereObj.value);
                                required = true;
                            }
                            var newWhereString = stringify_object_1.default(where, { singleQuotes: false });
                            var finalWhereString = originalWhereString ? "{AND:[" + originalWhereString + "," + newWhereString + "]}" : newWhereString;
                            if (originalWhereObj) {
                                originalWhereObj.value = language_1.parseValue(new language_1.Source(finalWhereString));
                            }
                            else {
                                clone.arguments.push({
                                    kind: 'Argument',
                                    name: { kind: 'Name', value: 'where' },
                                    value: language_1.parseValue(new language_1.Source(finalWhereString))
                                });
                            }
                            return clone;
                        }
                    }
                    return;
                },
                leave: function (node) {
                    if (node.kind === 'Field' && node.name.value !== '__typename') {
                        field.pop();
                    }
                }
            });
            var queryString = language_1.print(query);
            if (required)
                queryString = queryString.replace(/\$where: (\w*)Input,/, '$where: $1Input!,');
            return { fields: Array.from(fields), query: query, queryString: queryString };
        };
        Table.instances = Table.instances || {};
        this.schema = schema;
        this.name = this.schema.name;
        if (!this.schema.keys.includes('id')) {
            throw new MissingIDTableError_1.MissingIdTableError(this.name);
        }
        if (Table.instances[this.name]) {
            throw new UniqueSchemaError_1.UniqueSchemaError(this.name);
        }
        this.options = __assign({}, tableOptions);
        Table.instances[this.name] = this;
    }
    Table.getInstance = function (name) {
        if (!Table.instances[name]) {
            throw new SchemaInstanceNotFound_1.SchemaInstanceNotFound(name);
        }
        return Table.instances[name];
    };
    Table.prototype.getFields = function () {
        return this.schema.getFields();
    };
    /*
     * It apply the fields permissions policy by action and roles, throw an exception if is not a valid request
     *
     * @param action
     * @param role
     * @param model

    validatePermissions(action: ActionType, role: string | string[] | null | undefined, model: string[] | any): void {
        const fields = this.getFields();
        const allowedFields = Object.keys(this.getSchema(action, role));
        const modelFields = (Array.isArray(model) ? model : Object.keys(model)).filter(f => fields.includes(f));
        const intersection = allowedFields.filter(af => modelFields.includes(af));

        if (modelFields.length > intersection.length) {
            const invalidFields = modelFields.filter(mf => !intersection.includes(mf));
            throw new FieldsPermissionsError(action, invalidFields);
        }
    }
 */
    Table.prototype.shouldHasManyUpdate = function () {
        var fields = this.schema.getFields().filter(function (f) { return f !== 'createdAt' && f !== 'createdAt'; });
        return fields.length > 0;
    };
    //Insert where option in to the query
    // static dotConcat = (a: string | undefined, b: string) => a ? `${a}.${b}` : b;
    Table.prototype.getDefaultActions = function (type) {
        var _this = this;
        // OperationName for query is user or users, for mutation are createUser, updateUser ....
        var operationNames = Object.values(this.schema.names[type]);
        var resultResolvers = {};
        operationNames.forEach(function (operationName) {
            if (!_this.shouldHasManyUpdate())
                return;
            resultResolvers[operationName] = function (_, args, context, info) {
                if (args === void 0) { args = {}; }
                return __awaiter(_this, void 0, void 0, function () {
                    var user, subOperationName, action, result, capitalizedAction, isSingleMutation, _a, query, queryString, fields, where, finalWhere, exists, data, data;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                bm();
                                console.log('argsargsargs1', Mutate_1.deepClone(args));
                                return [4 /*yield*/, Mandarina_1.default.config.getUser(context)];
                            case 1:
                                user = _b.sent();
                                subOperationName = operationName.substr(0, 6);
                                action = (['create', 'update', 'delete'].includes(subOperationName) ? subOperationName : 'read');
                                capitalizedAction = utils_1.capitalize(action);
                                return [4 /*yield*/, this.callHook(this.name, 'beforeValidate', _, args, context, info)];
                            case 2:
                                _b.sent();
                                isSingleMutation = operationName === this.schema.names.mutation.update || operationName === this.schema.names.mutation.create;
                                _a = this.insertWhereIntoInfo(info, user, isSingleMutation), query = _a.query, queryString = _a.queryString, fields = _a.fields;
                                if (!(type === 'mutation')) return [3 /*break*/, 8];
                                if (!isSingleMutation) return [3 /*break*/, 4];
                                where = this.options.where && this.options.where(user);
                                if (!where) return [3 /*break*/, 4];
                                finalWhere = args.where ? { AND: [args.where, where] } : where;
                                return [4 /*yield*/, context.prisma.exists[this.name](finalWhere)];
                            case 3:
                                exists = (_b.sent());
                                if (!exists) {
                                    return [2 /*return*/, null];
                                }
                                _b.label = 4;
                            case 4:
                                //VALIDATE IF USER CAN MUTATE THOSE FIELDS
                                this.schema.validateMutation(action, Mutate_1.deepClone(args), user && user.roles || []);
                                return [4 /*yield*/, this.callHook(this.name, "before" + capitalizedAction, _, args, context, query)];
                            case 5:
                                _b.sent();
                                console.log('argsargsargs2', args);
                                /*
                                HACK https://github.com/prisma/prisma/issues/4327
                                 */
                                // if (`before${capitalizedAction}` === 'beforeUpdate' || `before${capitalizedAction}` === 'beforeCreate') {
                                //     const flat = flatten(args.data)
                                //     const where = args.where
                                //     let run = false
                                //     let withDeleteMany: any = {}
                                //     let withoutDeleteMany: any = {}
                                //     Object.keys(flat).forEach((key) => {
                                //         if (key.match(/\.deleteMany\.0$/)) {
                                //             run = true
                                //             withDeleteMany[key] = flat[key]
                                //         } else {
                                //             withoutDeleteMany[key] = flat[key]
                                //         }
                                //     })
                                //     if (run) {
                                //         await prismamethod({where, data: unflatten(withdeletemany)}, info);
                                //         args.data = unflatten(withoutDeleteMany)
                                //     }
                                // }
                                console.log('queryString', queryString);
                                return [4 /*yield*/, context.prisma.request(queryString, args)];
                            case 6:
                                data = (_b.sent());
                                if (data.errors) {
                                    console.log('args', args);
                                    console.log('queryString', queryString);
                                    console.log('data', data);
                                    console.error(data.errors);
                                }
                                result = data.data[info.path.key];
                                context.result = result;
                                return [4 /*yield*/, this.callHook(this.name, "after" + capitalizedAction, _, args, context, query)];
                            case 7:
                                _b.sent();
                                this.schema.validateQuery(fields, user && user.roles || []);
                                _b.label = 8;
                            case 8:
                                if (!(type === 'query')) return [3 /*break*/, 12];
                                // console.dir(JSON.parse(JSON.stringify(info)),{depth:1})
                                return [4 /*yield*/, this.callHook(this.name, 'beforeQuery', _, args, context, query)];
                            case 9:
                                // console.dir(JSON.parse(JSON.stringify(info)),{depth:1})
                                _b.sent();
                                if (!!info.fieldName.match(/Connection$/)) {
                                    this.schema.validateConnection(user && user.roles || []);
                                }
                                else {
                                    this.schema.validateQuery(fields, user && user.roles || []);
                                }
                                //Validate if the roles is able to read those fields
                                if (operationName === this.schema.names.query.single) {
                                    queryString = queryString.replace(operationName, this.schema.names.query.plural);
                                    queryString = queryString.replace(new RegExp(this.schema.names.input.where.single + "!?"), this.schema.names.input.where.plural + '!');
                                }
                                return [4 /*yield*/, context.prisma.request(queryString, args)];
                            case 10:
                                data = (_b.sent());
                                if (data.errors) {
                                    console.log('args', args);
                                    console.log('queryString', queryString);
                                    console.log('data', data);
                                    console.error(data.errors);
                                }
                                result = data.data[info.path.key];
                                if (operationName === this.schema.names.query.single) {
                                    result = data.data[this.schema.names.query.plural];
                                    result = result && result.length === 1 ? result[0] : null;
                                }
                                context.result = result;
                                return [4 /*yield*/, this.callHook(this.name, 'afterQuery', _, args, context, info)];
                            case 11:
                                _b.sent();
                                _b.label = 12;
                            case 12:
                                bm(operationName + " " + type, result);
                                return [2 /*return*/, result];
                        }
                    });
                });
            };
        });
        return resultResolvers;
    };
    /**
     * Go back a mutation object to the original object
     */
    /**
     * Simple wrapper to execute the table hook if exists and sub hook (nested hooks)
     *
     * @param name
     * @param actionType
     * @param _
     * @param args
     * @param context
     * @param info
     */
    Table.prototype.callHook = function (schemaName, name, _, args, context, info) {
        return __awaiter(this, void 0, void 0, function () {
            var prefix, hookHandler, data, fields, schema, _i, fields_1, field, def, inline, operations, table, _a, operations_1, operation, hookName, args2, _b, args2_1, arg2, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 18, , 19]);
                        prefix = '';
                        if (name.indexOf('before') === 0)
                            prefix = 'before';
                        if (name.indexOf('after') === 0)
                            prefix = 'after';
                        hookHandler = this.options.hooks && this.options.hooks[name];
                        data = args.data;
                        if (!(data && prefix)) return [3 /*break*/, 15];
                        fields = Object.keys(data);
                        schema = mandarina_1.Schema.getInstance(schemaName);
                        _i = 0, fields_1 = fields;
                        _c.label = 1;
                    case 1:
                        if (!(_i < fields_1.length)) return [3 /*break*/, 15];
                        field = fields_1[_i];
                        def = schema.getPathDefinition(field);
                        inline = !!(def.table && def.table.relation && def.table.relation.link === 'INLINE');
                        if (!def.isTable) return [3 /*break*/, 14];
                        operations = Object.keys(data[field]);
                        if (!Table.instances[def.type]) {
                            console.warn("No table for " + def.type + " no neasted hooks applied");
                            return [3 /*break*/, 14];
                        }
                        table = Table.getInstance(def.type);
                        _a = 0, operations_1 = operations;
                        _c.label = 2;
                    case 2:
                        if (!(_a < operations_1.length)) return [3 /*break*/, 14];
                        operation = operations_1[_a];
                        hookName = "" + prefix + utils_1.capitalize(operation);
                        args2 = data[field][operation];
                        if (!Array.isArray(args2)) return [3 /*break*/, 9];
                        _b = 0, args2_1 = args2;
                        _c.label = 3;
                    case 3:
                        if (!(_b < args2_1.length)) return [3 /*break*/, 8];
                        arg2 = args2_1[_b];
                        if (!inline) return [3 /*break*/, 5];
                        return [4 /*yield*/, table.callHook(def.type, hookName, _, { data: arg2 }, context, info)];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, table.callHook(def.type, hookName, _, arg2, context, info)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        _b++;
                        return [3 /*break*/, 3];
                    case 8: return [3 /*break*/, 13];
                    case 9:
                        if (!inline) return [3 /*break*/, 11];
                        return [4 /*yield*/, table.callHook(def.type, hookName, _, { data: args2 }, context, info)];
                    case 10:
                        _c.sent();
                        return [3 /*break*/, 13];
                    case 11: return [4 /*yield*/, table.callHook(def.type, hookName, _, args2, context, info)];
                    case 12:
                        _c.sent();
                        _c.label = 13;
                    case 13:
                        _a++;
                        return [3 /*break*/, 2];
                    case 14:
                        _i++;
                        return [3 /*break*/, 1];
                    case 15:
                        if (!hookHandler) return [3 /*break*/, 17];
                        return [4 /*yield*/, hookHandler(_, args, context, info)];
                    case 16:
                        _c.sent();
                        _c.label = 17;
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        e_1 = _c.sent();
                        console.error("Error executing hook: \"" + name + "\" in Table: " + schemaName + "\"");
                        throw e_1;
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    return Table;
}());
exports.Table = Table;
var time = new Date().getTime();
function bm(description) {
    if (description === void 0) { description = ''; }
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    description && console.info.apply(console, [description].concat(args, [new Date().getTime() - time]));
    time = new Date().getTime();
}
exports.bm = bm;
