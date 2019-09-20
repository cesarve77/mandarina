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
var flat_1 = require("flat");
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
    Table.prototype.getDefaultActions = function (type) {
        var _this = this;
        var result = {};
        // OperationName for query is user or users, for mutation are createUser, updateUser ....
        var operationNames = Object.values(this.schema.names[type]);
        operationNames.forEach(function (operationName) {
            if (!_this.shouldHasManyUpdate())
                return;
            result[operationName] = function (_, args, context, info) {
                if (args === void 0) { args = {}; }
                return __awaiter(_this, void 0, void 0, function () {
                    var user, time, bm, subOperationName, action, prismaMethod, result, capitalizedAction, graphqlFields;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, Mandarina_1.default.config.getUser(context)
                                // console.log('*****************************************************')
                                // console.log('operationName', operationName)
                                // console.log('args')
                                // console.dir(args, {depth: null})
                            ];
                            case 1:
                                user = _a.sent();
                                time = new Date().getTime();
                                bm = function (description) {
                                    if (description) {
                                        console.log(description, new Date().getTime() - time);
                                    }
                                    time = new Date().getTime();
                                };
                                bm();
                                subOperationName = operationName.substr(0, 6);
                                action = (['create', 'update', 'delete'].includes(subOperationName) ? subOperationName : 'read');
                                prismaMethod = context.prisma[type][operationName];
                                capitalizedAction = utils_1.capitalize(action);
                                // TODO: Review the hooks architecture for adding a way to execute hooks of nested operations
                                return [4 /*yield*/, this.callHook(this.name, 'beforeValidate', _, args, context, info)];
                            case 2:
                                // TODO: Review the hooks architecture for adding a way to execute hooks of nested operations
                                _a.sent();
                                if (!(type === 'mutation')) return [3 /*break*/, 6];
                                // if (errors.length > 0) {
                                //     await this.callHook('validationFailed', action, _, args, context, info);
                                // } else {
                                //     await this.callHook('afterValidate', action, _, args, context, info);
                                // }
                                this.schema.validateMutation(action, Mutate_1.deepClone(args), user && user.roles);
                                return [4 /*yield*/, this.callHook(this.name, "before" + capitalizedAction, _, args, context, info)];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, prismaMethod(args, info)];
                            case 4:
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
                                //         await prismaMethod({where, data: unflatten(withDeleteMany)}, info);
                                //         args.data = unflatten(withoutDeleteMany)
                                //     }
                                // }
                                result = _a.sent();
                                //
                                context.result = result;
                                return [4 /*yield*/, this.callHook(this.name, "after" + capitalizedAction, _, args, context, info)];
                            case 5:
                                _a.sent();
                                _a.label = 6;
                            case 6:
                                if (!(type === 'query')) return [3 /*break*/, 10];
                                graphqlFields = require('graphql-fields');
                                console.log(flat_1.flatten(graphqlFields(info)));
                                return [4 /*yield*/, this.callHook(this.name, 'beforeQuery', _, args, context, info)];
                            case 7:
                                _a.sent();
                                return [4 /*yield*/, prismaMethod(args, info)];
                            case 8:
                                //this.validatePermissions('read', roles, fieldsList(info));
                                result = _a.sent();
                                // console.log(graphqlFields(info))
                                context.result = result;
                                return [4 /*yield*/, this.callHook(this.name, 'afterQuery', _, args, context, info)];
                            case 9:
                                _a.sent();
                                _a.label = 10;
                            case 10: 
                            // bm('done in ')
                            // console.log('result')
                            // console.dir(result)
                            //
                            // console.log('*****************************************************')
                            return [2 /*return*/, result];
                        }
                    });
                });
            };
        });
        return result;
    };
    Table.prototype.register = function () {
        // TODO: Do we need to implement this method?
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
            var hookHandler, data, fields, schema, _i, fields_1, field, def, inline, operations, _a, operations_1, operation, hookName, args2, table, _b, args2_1, arg2, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('--------------------');
                        console.log(schemaName, name, args);
                        console.log('--------------------');
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 19, , 20]);
                        hookHandler = this.options.hooks && this.options.hooks[name];
                        if (!hookHandler) return [3 /*break*/, 18];
                        data = args.data;
                        fields = Object.keys(data);
                        schema = mandarina_1.Schema.getInstance(schemaName);
                        _i = 0, fields_1 = fields;
                        _c.label = 2;
                    case 2:
                        if (!(_i < fields_1.length)) return [3 /*break*/, 16];
                        field = fields_1[_i];
                        def = schema.getPathDefinition(field);
                        inline = !!(def.table && def.table.relation && def.table.relation.link === 'INLINE');
                        if (!def.isTable) return [3 /*break*/, 15];
                        operations = Object.keys(data[field]);
                        _a = 0, operations_1 = operations;
                        _c.label = 3;
                    case 3:
                        if (!(_a < operations_1.length)) return [3 /*break*/, 15];
                        operation = operations_1[_a];
                        hookName = "before" + utils_1.capitalize(operation);
                        args2 = data[field][operation];
                        if (!Table.instances[def.type])
                            return [3 /*break*/, 14];
                        table = Table.getInstance(def.type);
                        if (!Array.isArray(args2)) return [3 /*break*/, 10];
                        _b = 0, args2_1 = args2;
                        _c.label = 4;
                    case 4:
                        if (!(_b < args2_1.length)) return [3 /*break*/, 9];
                        arg2 = args2_1[_b];
                        if (!inline) return [3 /*break*/, 6];
                        return [4 /*yield*/, table.callHook(def.type, hookName, _, { data: arg2 }, context, info)];
                    case 5:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 6: return [4 /*yield*/, table.callHook(def.type, hookName, _, arg2, context, info)];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        _b++;
                        return [3 /*break*/, 4];
                    case 9: return [3 /*break*/, 14];
                    case 10:
                        if (!inline) return [3 /*break*/, 12];
                        return [4 /*yield*/, table.callHook(def.type, hookName, _, { data: args2 }, context, info)];
                    case 11:
                        _c.sent();
                        return [3 /*break*/, 14];
                    case 12: return [4 /*yield*/, table.callHook(def.type, hookName, _, args2, context, info)];
                    case 13:
                        _c.sent();
                        _c.label = 14;
                    case 14:
                        _a++;
                        return [3 /*break*/, 3];
                    case 15:
                        _i++;
                        return [3 /*break*/, 2];
                    case 16: return [4 /*yield*/, hookHandler(_, args, context, info)];
                    case 17:
                        _c.sent();
                        _c.label = 18;
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        e_1 = _c.sent();
                        console.error("Error executing hook: \"" + name + "\" in Table: " + schemaName + "\"");
                        console.error(e_1);
                        return [3 /*break*/, 20];
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    return Table;
}());
exports.Table = Table;
