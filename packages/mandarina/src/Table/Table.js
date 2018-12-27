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
var utils_1 = require("./utils");
var InvalidActionError_1 = require("../Errors/InvalidActionError");
var UniqueTableError_1 = require("../Errors/UniqueTableError");
var TableInstanceNotFound_1 = require("../Errors/TableInstanceNotFound");
var defaultPermissions = { read: {}, create: {}, update: {}, delete: {} };
var defaultActions = Object.keys(defaultPermissions);
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
        this.name = this.schema.name;
        if (Table.instances[this.name]) {
            throw new UniqueTableError_1.UniqueTableError(this.name);
        }
        this.schema = schema;
        this.options = __assign({}, schema.options, tableOptions);
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
    /**
     * Returns the resource schema appliying the authorization and data exposition policy
     *
     * @param action
     * @param role
     *
     * @return Schema
     */
    Table.prototype.getSchema = function (action, role) {
        var _this = this;
        var roles = Array.isArray(role) ? role : [role];
        if (!defaultActions.includes(action)) {
            throw new InvalidActionError_1.InvalidActionError(action);
        }
        var fields = this.getFields();
        var permissionsByRole = this.getPermissions()[action];
        var allowedFieldsNames = Object.keys(permissionsByRole)
            .filter(function (k) { return roles.includes(k); })
            .map(function (k) { return permissionsByRole[k]; })
            .reduce(function (p, c) { return p.concat(c); }, permissionsByRole.everyone);
        return fields
            .filter(function (fieldName) { return allowedFieldsNames.includes(fieldName); })
            .reduce(function (res, fieldName) {
            var _a;
            return (__assign({}, res, (_a = {}, _a[fieldName] = _this.schema.shape[fieldName], _a)));
        }, {});
    };
    /**
     * Returns the the authorization schema definition for the instance
     *
     * @return Permissions
     */
    Table.prototype.getPermissions = function () {
        var _this = this;
        var fields = this.getFields();
        if (!this.permissions) {
            this.permissions = defaultPermissions;
            fields.forEach(function (field) {
                var def = _this.schema.getPathDefinition(field);
                defaultActions.forEach(function (action) {
                    def.permissions = def.permissions || {};
                    if (!def.permissions[action]) {
                        _this.permissions[action].everyone = _this.permissions[action].everyone || [];
                        _this.permissions[action].everyone.push(field);
                        return;
                    }
                    if (def.permissions[action] === 'nobody')
                        return;
                    var roles = def.permissions[action].split('|');
                    roles.forEach(function (role) {
                        _this.permissions[action][role] = _this.permissions[action][role] || [];
                        _this.permissions[action][role].push(field);
                    });
                });
            });
        }
        return this.permissions;
    };
    Table.prototype.getDefaultActions = function (type) {
        var _this = this;
        var result = {};
        // OperationName for query is user or users, for mutation are createUser, updateUser ....
        var operationNames = Object.values(this.names[type]);
        var _a = this.options, onBefore = _a.onBefore, onAfter = _a.onAfter;
        operationNames.forEach(function (operationName) {
            result[operationName] = function (_, args, context, info) {
                if (args === void 0) { args = {}; }
                return __awaiter(_this, void 0, void 0, function () {
                    var subOperationName, action, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                subOperationName = operationName.substr(0, 6);
                                action = (['create', 'update', 'delete'].includes(subOperationName) ? subOperationName : 'read');
                                if (!onBefore) return [3 /*break*/, 2];
                                return [4 /*yield*/, onBefore(action, _, args, context, info)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [4 /*yield*/, context.prisma[type][operationName](args, info)];
                            case 3:
                                result = _a.sent();
                                context.result = result;
                                if (!onAfter) return [3 /*break*/, 5];
                                return [4 /*yield*/, onAfter(action, _, args, context, info)];
                            case 4:
                                _a.sent();
                                _a.label = 5;
                            case 5: 
                            // TODO: remove in production
                            return [4 /*yield*/, utils_1.sleep(400)];
                            case 6:
                                // TODO: remove in production
                                _a.sent();
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
    return Table;
}());
exports.Table = Table;
