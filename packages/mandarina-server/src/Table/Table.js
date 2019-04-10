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
var UniqueTableError_1 = require("mandarina/build/Errors/UniqueTableError");
var TableInstanceNotFound_1 = require("mandarina/build/Errors/TableInstanceNotFound");
var utils_1 = require("mandarina/build/Schema/utils");
var MissingIDTableError_1 = require("mandarina/build/Errors/MissingIDTableError");
/**
 *
 * A Table instance is the representation of the one of several of the followings:
 * Physic table in the data base
 * Form
 * List of results
 */
var Table = /** @class */ (function () {
    /**
     *
     * @param schema
     * @param tableOptions
     */
    function Table(schema, tableOptions) {
        Table.instances = Table.instances || {};
        this.schema = schema;
        this.name = this.schema.name;
        if (!this.schema.keys.includes('id')) {
            throw new MissingIDTableError_1.MissingIdTableError(this.name);
        }
        if (Table.instances[this.name]) {
            throw new UniqueTableError_1.UniqueTableError(this.name);
        }
        this.options = __assign({}, schema.options, tableOptions);
        Table.instances[this.name] = this;
    }
    Table.getInstance = function (name) {
        if (!Table.instances[name]) {
            throw new TableInstanceNotFound_1.TableInstanceNotFound(name);
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
    Table.prototype.getDefaultActions = function (type) {
        var _this = this;
        var result = {};
        // OperationName for query is user or users, for mutation are createUser, updateUser ....
        var operationNames = Object.values(this.schema.names[type]);
        operationNames.forEach(function (operationName) {
            result[operationName] = function (_, args, context, info) {
                if (args === void 0) { args = {}; }
                return __awaiter(_this, void 0, void 0, function () {
                    var time, bm, subOperationName, action, prismaMethod, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log('*****************************************************');
                                console.log('operationName', operationName);
                                console.log('args', args);
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
                                console.log('type', type);
                                console.log('action', action);
                                console.log('before', "before" + utils_1.capitalize(action));
                                if (!(type === 'mutation')) return [3 /*break*/, 5];
                                return [4 /*yield*/, this.callHook('beforeValidate', _, args, context, info)];
                            case 1:
                                _a.sent();
                                //TODO: Flatting nested fields operation (context, update, create)
                                // console.log('123123123',this.flatFields(args.data))
                                // const errors = this.schema.validate(this.flatFields(args.data));
                                // if (errors.length > 0) {
                                //     await this.callHook('validationFailed', action, _, args, context, info);
                                // } else {
                                //     await this.callHook('afterValidate', action, _, args, context, info);
                                // }
                                return [4 /*yield*/, this.callHook("before" + utils_1.capitalize(action), _, args, context, info)];
                            case 2:
                                //TODO: Flatting nested fields operation (context, update, create)
                                // console.log('123123123',this.flatFields(args.data))
                                // const errors = this.schema.validate(this.flatFields(args.data));
                                // if (errors.length > 0) {
                                //     await this.callHook('validationFailed', action, _, args, context, info);
                                // } else {
                                //     await this.callHook('afterValidate', action, _, args, context, info);
                                // }
                                _a.sent();
                                return [4 /*yield*/, prismaMethod(args, info)];
                            case 3:
                                //this.validatePermissions(action, roles, args.data);
                                result = _a.sent();
                                context.result = result;
                                return [4 /*yield*/, this.callHook("after" + utils_1.capitalize(action), _, args, context, info)];
                            case 4:
                                _a.sent();
                                _a.label = 5;
                            case 5:
                                if (!(type === 'query')) return [3 /*break*/, 9];
                                return [4 /*yield*/, this.callHook('beforeQuery', _, args, context, info)];
                            case 6:
                                _a.sent();
                                return [4 /*yield*/, prismaMethod(args, info)];
                            case 7:
                                //this.validatePermissions('read', roles, fieldsList(info));
                                result = _a.sent();
                                context.result = result;
                                return [4 /*yield*/, this.callHook('afterQuery', _, args, context, info)];
                            case 8:
                                _a.sent();
                                _a.label = 9;
                            case 9:
                                console.log('result', result);
                                bm('done in ');
                                console.log('*****************************************************');
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
     * Simple wrapper to execute the table hook if exists
     *
     * @param name
     * @param actionType
     * @param _
     * @param args
     * @param context
     * @param info
     */
    Table.prototype.callHook = function (name, _, args, context, info) {
        return __awaiter(this, void 0, void 0, function () {
            var hookHandler;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('this.options.hooks', name, this.options.hooks);
                        hookHandler = this.options.hooks && this.options.hooks[name];
                        if (!hookHandler) return [3 /*break*/, 2];
                        return [4 /*yield*/, hookHandler(_, args, context, info)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return Table;
}());
exports.Table = Table;
