"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var graphql_tag_1 = require("graphql-tag");
var react_apollo_1 = require("react-apollo");
var __1 = require("..");
var Mandarina_1 = require("../Mandarina");
exports.AuthTable = function (_a) {
    var action = _a.action, table = _a.table, children = _a.children, props = __rest(_a, ["action", "table", "children"]);
    if (table instanceof __1.Table)
        table = table.name;
    var QUERY = graphql_tag_1.default(templateObject_1 || (templateObject_1 = __makeTemplateObject(["query AuthFields($action: String!, $table:String!) {AuthFields(action: $action, table: $table) }"], ["query AuthFields($action: String!, $table:String!) {AuthFields(action: $action, table: $table) }"])));
    return (<react_apollo_1.Query query={QUERY} variables={{ action: action, table: table }}>
            {function (_a) {
        var data = _a.data, loading = _a.loading, queryProps = __rest(_a, ["data", "loading"]);
        var fields = data && data.AuthFields;
        if (typeof children === 'function')
            return children(__assign({ fields: fields, loading: loading }, props));
        return react_1.default.cloneElement(children, __assign({ fields: fields, loading: loading }, queryProps, props));
    }}
        </react_apollo_1.Query>);
};
var roles = [];
var authFields = {};
exports.actions = ['read', 'create', 'update', 'delete'];
exports.staticPermissions = ['everyone', 'nobody', 'logged'];
exports.AuthTable.reset = function () {
    roles = [];
    authFields = {};
};
exports.AuthTable.getRoles = function (args) {
    if (!roles.length) {
        var tables = Object.values(__1.Table.instances);
        tables.forEach(function (table) {
            authFields[table.name] = authFields[table.name] || { read: {}, create: {}, update: {}, delete: {}, };
            var permissions = table.schema.permissions;
            var tableRoles = [];
            if (permissions) {
                exports.actions.forEach(function (action) {
                    var permission = permissions[action];
                    if (permission && !exports.staticPermissions.includes(permission) && !roles.includes(permission)) {
                        permission.split('|').forEach(function (role) { return roles.push(role); });
                        tableRoles.push(permission);
                    }
                });
            }
            var fields = table.getFields();
            fields.forEach(function (field) {
                var def = table.schema.getPathDefinition(field);
                exports.actions.forEach(function (action) {
                    def.permissions = def.permissions || {};
                    if (!def.permissions[action]) {
                        authFields[table.name][action].everyone = authFields[table.name][action].everyone || [];
                        authFields[table.name][action].everyone.push(field);
                        return;
                    }
                    if (def.permissions[action] === 'nobody')
                        return;
                    var roles = def.permissions[action].split('|');
                    roles.forEach(function (role) {
                        authFields[table.name][action][role] = authFields[table.name][action][role] || [];
                        authFields[table.name][action][role].push(field);
                    });
                });
            });
        });
    }
    if (!args)
        return roles;
    if (!args.role)
        return authFields[args.table][args.action];
    return authFields[args.table][args.action][args.role];
};
exports.AuthTable.resolvers = {
    AuthFields: function (_, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
        var allRoles, user, userRoles, everyone, fields, extraRoles, alcFields;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allRoles = exports.AuthTable.getRoles();
                    return [4 /*yield*/, __1.Table.config.getUser(context)];
                case 1:
                    user = _a.sent();
                    userRoles = (user && user.roles) || [];
                    if (!exports.actions.includes(args.action))
                        throw new Error("Action only can be one of ['read', 'create', 'update', 'delete'] now is: " + args.action + " ");
                    if (!authFields[args.table])
                        throw new Error("Table " + args.table + " not found getting AuthFields ");
                    everyone = authFields[args.table][args.action].everyone;
                    fields = everyone ? everyone : [];
                    extraRoles = [];
                    userRoles.forEach(function (role) {
                        if (allRoles.includes(role)) {
                            exports.addToSet(fields, authFields[args.table][args.action][role] || []);
                        }
                        else {
                            extraRoles.push(role);
                        }
                    });
                    if (!extraRoles.length)
                        return [2 /*return*/, fields];
                    return [4 /*yield*/, context.prisma.query.authTables({
                            where: {
                                role_in: userRoles,
                                table: args.table,
                                action: args.action,
                            }
                        })];
                case 2:
                    alcFields = _a.sent();
                    console.log('alcFields', alcFields);
                    exports.addToSet(fields, alcFields);
                    return [2 /*return*/, fields
                        /*const staticRoles = roles.filter(permissionRoles.includes)
                        const dynamicRoles = roles.filter((field: string) => !permissionRoles.includes(field))
                
                
                        const table = Table.getInstance(args.table)
                        const permissions = table.options.permissions
                        const userId = Table.config.getUserId(context)
                
                        if (permissions && permissions[args.action]) {
                            if (permissions[args.action] === 'everyone') return table.schema.getFields()
                            if (permissions[args.action] === 'nobody') return null
                            if (permissions[args.action] === 'logged' && userId) return table.schema.getFields()
                            const permissionRoles = permissions[args.action].split('|')
                
                
                            const result: string[] = []
                            if (staticRoles.length) {
                
                            }
                            if (dynamicRoles.length) {
                                const response = await context.prisma.query.authTables({
                                    where: {
                                        role_in: userRoles,
                                        table: args.table,
                                        action: args.action,
                                    }
                                })
                                const fields = response && response.data && response.data.authTables
                                if (fields) return result.concat(fields)
                            }
                            return result.length ? result : null
                        }
                        return table.schema.getFields()*/
                    ];
            }
        });
    }); }
};
exports.AuthTable.saveFiles = function () {
    var model = "type AuthTable {\n                        role: String!\n                        table: String!\n                        action: String!\n                        field: String\n                        id: ID! @unique\n                  }";
    var operation = "extend type Query {\n                            AuthFields(action: String!, table: String!) :  [String!]\n                       }";
    var fs = require('fs');
    var yaml = require('node-yaml');
    var prismaDir = Mandarina_1.Mandarina.config.prismaDir;
    var fileName = 'mandarina.auth';
    var fileAbsOperation = prismaDir + "/datamodel/" + fileName + ".operations.graphql";
    var fileAbsModel = prismaDir + "/datamodel/" + fileName + ".model.graphql";
    var fileRelModel = "datamodel/" + fileName + ".model.graphql";
    fs.writeFileSync(fileAbsModel, model);
    fs.writeFileSync(fileAbsOperation, operation);
    var prismaYaml = prismaDir + "/prisma.yml";
    var prisma = yaml.readSync(prismaYaml) || {};
    prisma.datamodel = prisma.datamodel || [];
    if (!Array.isArray(prisma.datamodel))
        prisma.datamodel = [prisma.datamodel];
    if (!prisma.datamodel.includes(fileRelModel))
        prisma.datamodel.push(fileRelModel);
    yaml.writeSync(prismaYaml, prisma);
};
exports.addToSet = function (into, toBeAdded) { return toBeAdded.forEach(function (item) { return !into.includes(item) && into.push(item); }); };
var templateObject_1;
