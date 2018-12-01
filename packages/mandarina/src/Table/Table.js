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
var Schema_1 = require("../Schema/Schema");
var utils_1 = require("./utils");
var browser_or_node_1 = require("browser-or-node");
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
        this.path = this._getFilePath();
        this.schema = schema instanceof Schema_1.Schema ? schema : new Schema_1.Schema(schema, tableOptions);
        this.options = __assign({ resolvers: {} }, schema.options, tableOptions);
        if (!this.options.virtual)
            this.schema.extend({
                id: {
                    type: String,
                    permissions: {
                        read: this.schema.permissions.read,
                        create: 'nobody',
                        update: 'nobody',
                    }
                }
            });
        this.name = tableOptions.name || this.schema.name;
        var single = utils_1.singularize(this.name);
        var singleUpper = utils_1.capitalize(single);
        var plural = utils_1.pluralize(this.name);
        var pluralUpper = utils_1.capitalize(plural);
        var connection = plural + "Connection";
        this.names = {
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
        Table.instances = Table.instances || {};
        if (Table.instances[this.name])
            throw new Error("Table named " + this.name + " already exists, names should be uniques");
        Table.instances[this.name] = this;
    }
    Table.getInstance = function (name) {
        var instance = Table.instances[name];
        if (!instance)
            throw new Error("No table named " + name);
        return instance;
    };
    Table.prototype.getFields = function () {
        return this.schema.getFields();
    };
    Table.prototype.getResolvers = function (type) {
        var resolvers = this.options.resolvers || {};
        var result = {};
        Object.keys(resolvers).forEach(function (key) {
            if (resolvers[key].type === type)
                result[key] = resolvers[key].resolver;
        });
        return result;
    };
    Table.prototype.getDefaultResolvers = function (type) {
        var _this = this;
        if (browser_or_node_1.isBrowser)
            throw new Error('getDefaultResolvers is not available on browser');
        /* SEVER-START */
        if (this.schema.options.virtual) {
            return this.getResolvers(type);
        }
        var result = {};
        var operationNames = Object.values(this.names[type]); //operationName for query is user or users, for mutation are createUser, updateUser ....
        var _a = this.options, onBefore = _a.onBefore, onAfter = _a.onAfter;
        operationNames.forEach(function (operationName) {
            result[operationName] = function (_, args, context, info) {
                if (args === void 0) { args = {}; }
                return __awaiter(_this, void 0, void 0, function () {
                    var subOperationName, action, user, _a, result;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                subOperationName = operationName.substr(0, 6);
                                action = (['create', 'update', 'delete'].includes(subOperationName) ? subOperationName : 'read');
                                return [4 /*yield*/, Promise.resolve(Table.config.getUser(context))
                                    //todo deletion
                                ];
                            case 1:
                                user = _b.sent();
                                //todo deletion
                                console.log(user);
                                //const fields = Object.keys(flatten({[this.name]: graphqlFields(info)}))
                                //if (type === 'mutation') this.validate(args.data,fields)
                                //const userId = Table.config.getUserId(context)
                                //const restrictionQuery = await this.checkPermissionsTable({type, operationName, userId})
                                //await this.checkPermissionsFields({type, operationName, info, userId})
                                //if (restrictionQuery) {
                                //    let query = args.where || {}
                                //    args.where = {AND: [query, restrictionQuery]}
                                //}
                                _a = onBefore;
                                if (!_a) 
                                //const fields = Object.keys(flatten({[this.name]: graphqlFields(info)}))
                                //if (type === 'mutation') this.validate(args.data,fields)
                                //const userId = Table.config.getUserId(context)
                                //const restrictionQuery = await this.checkPermissionsTable({type, operationName, userId})
                                //await this.checkPermissionsFields({type, operationName, info, userId})
                                //if (restrictionQuery) {
                                //    let query = args.where || {}
                                //    args.where = {AND: [query, restrictionQuery]}
                                //}
                                return [3 /*break*/, 3];
                                return [4 /*yield*/, onBefore(action, _, args, context, info)];
                            case 2:
                                _a = (_b.sent());
                                _b.label = 3;
                            case 3:
                                //const fields = Object.keys(flatten({[this.name]: graphqlFields(info)}))
                                //if (type === 'mutation') this.validate(args.data,fields)
                                //const userId = Table.config.getUserId(context)
                                //const restrictionQuery = await this.checkPermissionsTable({type, operationName, userId})
                                //await this.checkPermissionsFields({type, operationName, info, userId})
                                //if (restrictionQuery) {
                                //    let query = args.where || {}
                                //    args.where = {AND: [query, restrictionQuery]}
                                //}
                                _a;
                                return [4 /*yield*/, context.prisma[type][operationName](args, info)];
                            case 4:
                                result = _b.sent();
                                context.result = result;
                                onAfter && onAfter(action, _, args, context, info);
                                return [4 /*yield*/, utils_1.sleep(400)]; //todo remove in production
                            case 5:
                                _b.sent(); //todo remove in production
                                return [2 /*return*/, result];
                        }
                    });
                });
            };
        });
        return result;
        /* SEVER-END */
    };
    Table.prototype.getGraphQLModel = function () {
        return utils_1.getGraphQLModel(this.schema, this.schema.name);
    };
    Table.prototype.getGraphQLInput = function () {
        return utils_1.getGraphQLInput(this.schema, this.schema.name);
    };
    // string with virtual schemas
    Table.prototype.getGraphQLOperations = function () {
        var response = '';
        var resolvers = this.options.resolvers;
        if (resolvers) {
            Object.keys(resolvers).forEach(function (resolverName) {
                var resolver = resolvers[resolverName];
                response += "extend type " + utils_1.capitalize(resolver.type) + " {\n\t" + resolverName + "(data: " + utils_1.capitalize(resolverName) + "Input!): " + resolver.result + "\n}";
            });
        }
        return response;
    };
    Table.prototype.saveDeclarationFiles = function () {
        var fs = require('fs');
        var path = require('path');
        fs.writeFileSync(path.join(this.path, utils_1.buildInterfaceName(this.name)) + '.ts', utils_1.getDeclarations(this));
        return this;
    };
    Table.prototype.saveFiles = function () {
        //if (isBrowser) throw new Error('getGraphQLSchema is not available on browser')
        var fs = require('fs');
        var path = require('path');
        var yaml = require('node-yaml');
        var prismaDir = Table.config.prismaDir;
        var prismaYaml = prismaDir + "/prisma.yml";
        if (Object.keys(Table.instances).length === 0) {
            var prisma = yaml.readSync(prismaYaml) || {};
            prisma.datamodel = [];
            yaml.writeSync(prismaYaml, prisma);
            var datamodelDir_1 = path.join(prismaDir, 'datamodel');
            fs.readdirSync(datamodelDir_1).forEach(function (file) {
                fs.unlinkSync(path.join(datamodelDir_1, file));
            });
        }
        var fileName = this.name.toLowerCase();
        var operations = this.getGraphQLOperations();
        if (operations) {
            var fileAbsInput = prismaDir + "/datamodel/" + fileName + ".input.graphql";
            var fileAbsOperations = prismaDir + "/datamodel/" + fileName + ".operations.graphql";
            fs.writeFileSync(fileAbsOperations, operations);
            fs.writeFileSync(fileAbsInput, this.getGraphQLInput());
        }
        if (this.options.virtual)
            return this;
        var model = this.getGraphQLModel();
        if (model) {
            var fileAbsModel = prismaDir + "/datamodel/" + fileName + ".model.graphql";
            var fileRelModel = "datamodel/" + fileName + ".model.graphql";
            fs.writeFileSync(fileAbsModel, model);
            var prisma = yaml.readSync(prismaYaml) || {};
            prisma.datamodel = prisma.datamodel || [];
            if (!Array.isArray(prisma.datamodel))
                prisma.datamodel = [prisma.datamodel];
            if (!prisma.datamodel.includes(fileRelModel))
                prisma.datamodel.push(fileRelModel);
            yaml.writeSync(prismaYaml, prisma);
        }
        return this;
    };
    //}
    Table.prototype.register = function () {
    };
    Table.prototype._getFilePath = function () {
        /* SEVER-START */
        var origPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };
        var err = new Error();
        var stack = err.stack;
        Error.prepareStackTrace = origPrepareStackTrace;
        var path = require('path');
        // @ts-ignore
        return path.dirname(stack[2].getFileName());
        /* SERVER-END */
    };
    /**
     * Configure is a function which takes 1 params as a Object
     * @param get
     */
    Table.config = {
        prismaDir: '/prisma',
        /**
         *
         * @param user
         */
        getUser: function (_a) {
            var user = _a.user;
            return user;
        },
    };
    Table.configure = function (options) {
        if (options.prismaDir)
            Table.config.prismaDir = options.prismaDir;
        if (options.getUser)
            Table.config.getUser = options.getUser;
    };
    return Table;
}());
exports.Table = Table;
