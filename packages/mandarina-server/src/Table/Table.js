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
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mandarina_1 = require("mandarina");
var UniqueSchemaError_1 = require("mandarina/build/Errors/UniqueSchemaError");
var SchemaInstanceNotFound_1 = require("mandarina/build/Errors/SchemaInstanceNotFound");
var utils_1 = require("mandarina/build/Schema/utils");
var MissingIDTableError_1 = require("mandarina/build/Errors/MissingIDTableError");
var Mandarina_1 = __importDefault(require("../Mandarina"));
var Mutate_1 = require("mandarina/build/Operations/Mutate");
var language_1 = require("graphql/language");
var stringify_object_1 = __importDefault(require("stringify-object"));
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
        this.insertWhereIntoInfo = function (info, user, isSingleMutation, action, operationName) {
            if (isSingleMutation === void 0) { isSingleMutation = false; }
            var _a, _b;
            var field = [];
            var fields = new Set();
            var required = false;
            var allowedVariables = ((_b = (_a = info.fieldNodes[0]) === null || _a === void 0 ? void 0 : _a.arguments) === null || _b === void 0 ? void 0 : _b.map(function (_a) {
                var value = _a.name.value;
                return value;
            })) || [];
            var query = language_1.visit(info.operation, {
                enter: function (node, key, parent, path, ancestors) {
                    if (node.kind === 'VariableDefinition') {
                        if (!allowedVariables.includes(node === null || node === void 0 ? void 0 : node.variable.name.value)) {
                            return null;
                        }
                    }
                    if (node.kind === 'Field' && ancestors.length === 2 && node !== info.fieldNodes[0]) {
                        return null;
                    }
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
                            var where = table.options.where(user, action, operationName);
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
            if (required) {
                queryString = queryString.replace(/\$where: (\w*)Input(,| |\))/, '$where: $1Input!$2');
            }
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
                                context.originalArgs = args;
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
                                _a = this.insertWhereIntoInfo(info, user, isSingleMutation, action, operationName), query = _a.query, queryString = _a.queryString, fields = _a.fields;
                                if (!(type === 'mutation')) return [3 /*break*/, 8];
                                if (!(isSingleMutation && (action === 'update' || action === 'delete'))) return [3 /*break*/, 4];
                                where = this.options.where && this.options.where(user, action, operationName);
                                if (!where) return [3 /*break*/, 4];
                                finalWhere = args.where ? { AND: [args.where, where] } : where;
                                return [4 /*yield*/, context.prisma.exists[this.name](finalWhere)];
                            case 3:
                                exists = (_b.sent());
                                if (!exists) {
                                    throw new Error(action + " on " + this.schema.name + " not found for " + JSON.stringify(where));
                                }
                                _b.label = 4;
                            case 4:
                                //VALIDATE IF USER CAN MUTATE THOSE FIELDS
                                this.schema.validateMutation(action, Mutate_1.deepClone(args), user && user.roles || []);
                                return [4 /*yield*/, this.callHook(this.name, "before" + capitalizedAction, _, args, context, query)];
                            case 5:
                                _b.sent();
                                return [4 /*yield*/, context.prisma.request(queryString, args)];
                            case 6:
                                data = (_b.sent());
                                if (data.errors) {
                                    console.error(data.errors);
                                }
                                result = Object.values(data.data)[0];
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
                                    console.error(data.errors);
                                }
                                result = Object.values(data.data)[0];
                                if (operationName === this.schema.names.query.single) {
                                    result = data.data[this.schema.names.query.plural];
                                    result = result && result.length === 1 ? result[0] : null;
                                }
                                context.result = result;
                                return [4 /*yield*/, this.callHook(this.name, 'afterQuery', _, args, context, info)];
                            case 11:
                                _b.sent();
                                _b.label = 12;
                            case 12: return [2 /*return*/, result];
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
            var prefix, globalHookHandler, hookHandler, fields, schema, fields_1, fields_1_1, field, def, inline, operations, table, operations_1, operations_1_1, operation, hookName, args2, args2_1, args2_1_1, arg2, e_1_1, e_2_1, e_3_1, e_4;
            var e_3, _a, e_2, _b, e_1, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 32, , 33]);
                        prefix = '';
                        if (name.indexOf('before') === 0)
                            prefix = 'before';
                        if (name.indexOf('after') === 0)
                            prefix = 'after';
                        globalHookHandler = Table.hooks[name];
                        hookHandler = this.options.hooks && this.options.hooks[name];
                        if (!(args.data && prefix)) return [3 /*break*/, 27];
                        fields = Object.keys(args.data);
                        schema = mandarina_1.Schema.getInstance(schemaName);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 25, 26, 27]);
                        fields_1 = __values(fields), fields_1_1 = fields_1.next();
                        _d.label = 2;
                    case 2:
                        if (!!fields_1_1.done) return [3 /*break*/, 24];
                        field = fields_1_1.value;
                        def = schema.getPathDefinition(field);
                        inline = !!(def.table && def.table.relation && def.table.relation.link === 'INLINE');
                        if (!def.isTable) return [3 /*break*/, 23];
                        operations = Object.keys(args.data[field]);
                        if (!Table.instances[def.type]) {
                            //console.warn(`No table for ${def.type} no neasted hooks applied`)
                            return [3 /*break*/, 23];
                        }
                        table = Table.getInstance(def.type);
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 21, 22, 23]);
                        operations_1 = (e_2 = void 0, __values(operations)), operations_1_1 = operations_1.next();
                        _d.label = 4;
                    case 4:
                        if (!!operations_1_1.done) return [3 /*break*/, 20];
                        operation = operations_1_1.value;
                        hookName = "" + prefix + utils_1.capitalize(operation);
                        args2 = args.data[field][operation];
                        if (!Array.isArray(args2)) return [3 /*break*/, 15];
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 12, 13, 14]);
                        args2_1 = (e_1 = void 0, __values(args2)), args2_1_1 = args2_1.next();
                        _d.label = 6;
                    case 6:
                        if (!!args2_1_1.done) return [3 /*break*/, 11];
                        arg2 = args2_1_1.value;
                        if (!inline) return [3 /*break*/, 8];
                        return [4 /*yield*/, table.callHook(def.type, hookName, _, arg2.data ? arg2 : { data: arg2 }, context, info)];
                    case 7:
                        _d.sent();
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, table.callHook(def.type, hookName, _, arg2.data ? arg2 : { data: arg2 }, context, info)];
                    case 9:
                        _d.sent();
                        _d.label = 10;
                    case 10:
                        args2_1_1 = args2_1.next();
                        return [3 /*break*/, 6];
                    case 11: return [3 /*break*/, 14];
                    case 12:
                        e_1_1 = _d.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 14];
                    case 13:
                        try {
                            if (args2_1_1 && !args2_1_1.done && (_c = args2_1.return)) _c.call(args2_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 14: return [3 /*break*/, 19];
                    case 15:
                        if (!inline) return [3 /*break*/, 17];
                        return [4 /*yield*/, table.callHook(def.type, hookName, _, args2.data ? args2 : { data: args2 }, context, info)];
                    case 16:
                        _d.sent();
                        return [3 /*break*/, 19];
                    case 17: return [4 /*yield*/, table.callHook(def.type, hookName, _, args2.data ? args2 : { data: args2 }, context, info)];
                    case 18:
                        _d.sent();
                        _d.label = 19;
                    case 19:
                        operations_1_1 = operations_1.next();
                        return [3 /*break*/, 4];
                    case 20: return [3 /*break*/, 23];
                    case 21:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 23];
                    case 22:
                        try {
                            if (operations_1_1 && !operations_1_1.done && (_b = operations_1.return)) _b.call(operations_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 23:
                        fields_1_1 = fields_1.next();
                        return [3 /*break*/, 2];
                    case 24: return [3 /*break*/, 27];
                    case 25:
                        e_3_1 = _d.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 27];
                    case 26:
                        try {
                            if (fields_1_1 && !fields_1_1.done && (_a = fields_1.return)) _a.call(fields_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 27:
                        if (!globalHookHandler) return [3 /*break*/, 29];
                        context.schemaName = schemaName;
                        context.name = name;
                        return [4 /*yield*/, globalHookHandler(_, args, context, info)];
                    case 28:
                        _d.sent();
                        _d.label = 29;
                    case 29:
                        if (!hookHandler) return [3 /*break*/, 31];
                        return [4 /*yield*/, hookHandler(_, args, context, info)];
                    case 30:
                        _d.sent();
                        _d.label = 31;
                    case 31: return [3 /*break*/, 33];
                    case 32:
                        e_4 = _d.sent();
                        console.error("Error executing hook: \"" + name + "\" in Table: " + schemaName + "\"");
                        console.error(e_4);
                        throw e_4;
                    case 33: return [2 /*return*/];
                }
            });
        });
    };
    Table.hooks = {};
    Table.setGlobalHooks = function (hooks) {
        Table.hooks = hooks;
    };
    return Table;
}());
exports.Table = Table;
// let time = new Date().getTime()
// export function bm(description = '',...args:any) {
//     description && console.info(description,...args, new Date().getTime() - time)
//     time = new Date().getTime()
//
// }
//# sourceMappingURL=Table.js.map