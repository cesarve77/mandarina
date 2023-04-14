"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var __1 = require("..");
var graphql_tag_1 = __importDefault(require("graphql-tag"));
var react_apollo_1 = require("react-apollo");
var utils_1 = require("./utils");
var Find_1 = require("./Find");
var lodash_1 = require("lodash");
var utils_2 = require("../utils");
exports.deepClone = function (obj) {
    return lodash_1.cloneDeep(obj);
};
var Mutate = /** @class */ (function (_super) {
    __extends(Mutate, _super);
    function Mutate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.buildQueryFromFields = function () { return utils_1.buildQueryFromFields(_this.props.fields || _this.props.schema.getFields()); };
        // update = (proxy: DataProxy, mutationResult: FetchResult<any>) => {
        //     if (this.props.type === 'create') {
        //         // @ts-ignore
        //         window.proxy = proxy
        //         console.log('mutationResult', mutationResult)
        //         const doc = mutationResult && mutationResult[this.props.schema.names.mutation.create]
        //
        //         // @ts-ignore
        //         const queries = proxy.data && proxy.data.data && proxy.data.data.ROOT_QUERY
        //         console.log('queries', queries)
        //         if (!queries) return
        //         const {names} = this.props.schema
        //
        //         Object.keys(queries).forEach(query => {
        //             const regExp = new RegExp(`^(${this.props.schema.names.query.connection}|${this.props.schema.names.query.plural})\\((.*)\\)`)
        //             // @ts-ignore
        //
        //             const match = query.match(regExp)
        //
        //             if (match) {
        //                 const queryName = match[1]
        //                 const queryFields = queryName === names.query.connection ? `
        //                      pageInfo {
        //                       hasNextPage
        //                       hasPreviousPage
        //                       startCursor
        //                       endCursor
        //                     }
        //                     edges {
        //                       node  {id}
        //                     }` : ` {id}`
        //                 const queryString = `
        //                   query ($where: ${names.input.where.connection}, $after: String, $first: Int, $skip: Int, $orderBy: ${names.orderBy})
        //                     { ${queryName} (where: $where, after: $after, first: $first, skip: $skip, orderBy: $orderBy) {
        //                             ${queryFields}
        //                         }
        //                     }`
        //                 console.log('queryFields', queryFields)
        //                 console.log('queryString', queryString)
        //                 const QUERY = gql(queryString)
        //                 let docs
        //                 const variables = JSON.parse(match[2])
        //
        //                 try {
        //                     const cache = proxy.readQuery({query: QUERY, variables});
        //                     // @ts-ignore
        //                     console.log(cache)
        //                     docs = cache && cache[queryName]
        //                 } catch (e) {
        //                     console.error('error', e)
        //                     docs = []
        //                 }
        //
        //                 console.log('docs', docs)
        //                 const where = variables.where || {}
        //                 const after = variables.after
        //                 const first = variables.first
        //                 const skip = variables.skip
        //                 const orderBy = variables.orderBy
        //                 if (queryName === names.query.connection) {
        //                     docs.edges.push({node: doc})
        //                 } else {
        //                     docs = docs.push(doc)
        //                 }
        //                 console.log('nodes', docs)
        //
        //                 proxy.writeQuery({
        //                     query: QUERY,
        //                     variables,
        //                     data: {[queryName]: docs}
        //                 });
        //
        //             }
        //             console.log('key.match(regExp)',)
        //         })
        //         console.log('proxy', proxy)
        //     }
        // }
        //
        //
        _this.refetchQueries = function (mutationResult) {
            return exports.refetchQueries(mutationResult, _this.props.client, _this.props.refetchSchemas, _this.props.schema);
        };
        return _this;
    }
    /**
     * walk al properties of the model add new properties with initiator, and wrap values with wrapper
     * @param {object} obj
     * @param {Schema} schema
     * @param {function} wrapper - wrap the value for eg. from {schema: []} return {schema: {create: []}}
     * @param {function} initiator - function with return the object with  initial value of the model (for each level)
     * @return {object} - transformed model
     */
    Mutate.prototype.spider = function (obj, schema, wrapper, initiator) {
        var _this = this;
        if (typeof obj !== "object" || obj === undefined || obj === null)
            return obj;
        if (Array.isArray(obj)) {
            return obj.map(function (obj) { return (_this.spider(obj, schema, wrapper, initiator)); });
        }
        else {
            var data_1 = initiator(obj, schema);
            Object.keys(obj).forEach(function (key) {
                var value = obj[key];
                var definition = schema.getPathDefinition(key);
                if (typeof value === "object" && value !== null && value !== undefined && !(value instanceof Date)) {
                    if (definition.isTable) {
                        var schema_1 = __1.Schema.getInstance(definition.type);
                        data_1[key] = wrapper(_this.spider(value, schema_1, wrapper, initiator), schema_1);
                    }
                    else {
                        var native = definition.type;
                        data_1[key] = wrapper(_this.spider(value, schema, wrapper, initiator), native);
                    }
                }
                else {
                    data_1[key] = (value);
                }
            });
            return data_1;
        }
    };
    Mutate.prototype.getSubSchemaMutations = function (model, schema) {
        return exports.getSubSchemaMutations(model, schema, this.props.type);
    };
    Mutate.prototype.getTypesDoc = function (obj, schema) {
        var wrapper = function (result) { return result; };
        var initiator = function (obj, schema) {
            var res = {
                __typename: schema.name
            };
            if (obj.id) {
                res.id = obj.id;
            }
            return res;
        };
        return this.spider(obj, schema, wrapper, initiator);
    };
    /**
     * get the model, transform it for prisma inputs and passed to mutationFn, returns the result
     * @param {object} model
     * @param {function} mutationFn - function got it from Mutation component, it receive the an object {variables: {data:model, where},optimisticResponse}
     * @return {Promise<{object}>} result of the mutation
     */
    Mutate.prototype.mutate = function (model, mutationFn) {
        var _a;
        var _b = this.props, schema = _b.schema, where = _b.where, type = _b.type, optimisticResponse = _b.optimisticResponse;
        var cleaned = exports.deepClone(model);
        //schema.clean(cleaned, this.props.fields)// fill null all missing keys
        var data = this.getSubSchemaMutations(cleaned, schema);
        var mutation = { variables: {} };
        if (type !== 'delete') {
            mutation.variables.data = data;
        }
        if (type === 'update' || type === 'delete') {
            mutation.variables.where = where;
            Object.assign(cleaned, where);
        }
        if (optimisticResponse !== false) {
            if (!optimisticResponse) {
                var docWithTypes = this.getTypesDoc(cleaned, schema);
                var names = schema.names;
                mutation.optimisticResponse = (_a = {}, _a[names.mutation[type]] = docWithTypes, _a);
            }
            else {
                mutation.optimisticResponse = optimisticResponse;
            }
        }
        return mutationFn(mutation);
    };
    Mutate.prototype.render = function () {
        var _this = this;
        var _a = this.props, type = _a.type, children = _a.children, schema = _a.schema, fields = _a.fields, findLoading = _a.loading, variables = _a.variables, update = _a.update, ignoreResults = _a.ignoreResults, optimisticResponse = _a.optimisticResponse, _b = _a.refetchQueries, refetchQueries = _b === void 0 ? this.refetchQueries : _b, awaitRefetchQueries = _a.awaitRefetchQueries, onCompleted = _a.onCompleted, onError = _a.onError, context = _a.context, client = _a.client, doc = _a.doc, fetchPolicy = _a.fetchPolicy;
        var names = schema.names;
        this.query = utils_1.buildQueryFromFields(fields);
        var queryString;
        if (type === 'update') {
            queryString = "mutation mutationFn($where: " + names.input.where.single + ", $data: " + names.input[type] + " ) { " + names.mutation[type] + "(data: $data, where: $where) " + this.query + " }";
        }
        else if (type === 'delete') {
            queryString = "mutation mutationFn($where: " + names.input.where.single + ") { " + names.mutation[type] + "(where: $where) {id} }";
        }
        else {
            queryString = "mutation mutationFn($data: " + names.input[type] + " ) { " + names.mutation[type] + "(data: $data) " + this.query + " }";
        }
        var MUTATION = graphql_tag_1.default(queryString);
        return (react_1.default.createElement(react_apollo_1.Mutation, { mutation: MUTATION, refetchQueries: refetchQueries, variables: variables, update: update, ignoreResults: ignoreResults, optimisticResponse: optimisticResponse, awaitRefetchQueries: awaitRefetchQueries, onCompleted: onCompleted, onError: onError, context: context, client: client, fetchPolicy: fetchPolicy }, function (mutationFn, _a) {
            var loading = _a.loading, data = _a.data, error = _a.error, called = _a.called, client = _a.client;
            if (error) {
                console.error(error);
            }
            return children({
                schema: schema,
                mutate: function (model) { return _this.mutate(model, mutationFn); },
                loading: findLoading || loading,
                data: data,
                error: error,
                called: called,
                client: client,
                doc: doc,
            });
        }));
    };
    return Mutate;
}(react_1.PureComponent));
exports.Mutate = Mutate;
var MutateWithApollo = react_apollo_1.withApollo(Mutate);
exports.Delete = function (_a) {
    var id = _a.id, schema = _a.schema, optimisticResponse = _a.optimisticResponse, props = __rest(_a, ["id", "schema", "optimisticResponse"]);
    var where = undefined;
    if (id) {
        if (typeof id === 'string') {
            where = { id: id };
        }
        else {
            where = id;
        }
    }
    return (react_1.default.createElement(MutateWithApollo, __assign({ type: 'delete', schema: schema, where: where, optimisticResponse: optimisticResponse }, props)));
};
exports.Create = function (_a) {
    var schema = _a.schema, optimisticResponse = _a.optimisticResponse, props = __rest(_a, ["schema", "optimisticResponse"]);
    return (react_1.default.createElement(MutateWithApollo, __assign({ type: 'create', schema: schema, optimisticResponse: optimisticResponse }, props)));
};
exports.Update = function (_a) {
    var id = _a.id, schema = _a.schema, children = _a.children, fields = _a.fields, optimisticResponse = _a.optimisticResponse, props = __rest(_a, ["id", "schema", "children", "fields", "optimisticResponse"]);
    var where = undefined;
    if (id) {
        if (typeof id === 'string') {
            where = { id: id };
        }
        else {
            where = id;
        }
    }
    return (react_1.default.createElement(Find_1.FindOne, __assign({ schema: schema, where: where, fields: fields, pollInterval: 0 }, props), function (_a) {
        var data = _a.data, findOneProps = __rest(_a, ["data"]);
        return (react_1.default.createElement(MutateWithApollo, __assign({ where: where, type: 'update', doc: data }, findOneProps, { schema: schema, optimisticResponse: optimisticResponse }), children));
    }));
};
exports.refetchQueries = function (mutationResult, client, refetchSchemas, schema) {
    if (refetchSchemas === void 0) { refetchSchemas = []; }
    var refetchQueries = [];
    var _a = (schema && schema.names.query) || {}, _b = _a.single, single = _b === void 0 ? '' : _b, _c = _a.plural, plural = _c === void 0 ? '' : _c, _d = _a.connection, connection = _d === void 0 ? '' : _d;
    // @ts-ignore
    client.cache.watches.forEach(function (_a) {
        var query = _a.query, variables = _a.variables;
        var queryName = query.definitions[0].selectionSet.selections[0].name.value;
        var names = [];
        if (refetchSchemas) {
            refetchSchemas.forEach(function (schemaName) {
                var schema = __1.Schema.getInstance(schemaName);
                names.push(schema.names.query.single);
                names.push(schema.names.query.plural);
                names.push(schema.names.query.connection);
            });
        }
        if (queryName === single || queryName === plural || queryName === connection || names.includes(queryName)) {
            refetchQueries.push({ query: query, variables: variables });
        }
    });
    return refetchQueries;
};
exports.getSubSchemaMutations = function (model, schema, mutationType) {
    var obj = {};
    if (typeof model !== "object" || model === undefined || model === null)
        return model;
    Object.keys(model).forEach(function (key) {
        var value = model[key];
        var definition = schema.getPathDefinition(key);
        //1 to n relations
        if (definition.isTable) {
            if (definition.isArray) {
                var schema_2 = __1.Schema.getInstance(definition.type);
                if (!Array.isArray(value)) {
                    obj[key] = null;
                }
                var result_1 = {};
                if (value && value.length === 0 && mutationType === 'update')
                    result_1.set = [];
                value && value.forEach(function (item) {
                    if (item && item.id && Object.keys(item).length === 1) {
                        result_1['connect'] = result_1['connect'] || [];
                        result_1['connect'].push(exports.getSubSchemaMutations(item, schema_2, mutationType));
                        if (mutationType === 'update') {
                            result_1['set'] = result_1['set'] || [];
                            result_1['set'].push({ id: item.id });
                        }
                    }
                    else if (item && item.id) {
                        if (mutationType === 'update') {
                            var id = item.id, clone = __rest(item, ["id"]);
                            result_1['update'] = result_1['update'] || [];
                            result_1['update'].push({
                                where: { id: id },
                                data: exports.getSubSchemaMutations(clone, schema_2, 'update')
                            });
                            result_1['set'] = result_1['set'] || [];
                            result_1['set'].push({ id: item.id });
                        }
                        else {
                            if (item.id) {
                                result_1['set'] = result_1['set'] || [];
                                result_1['set'].push({ id: item.id });
                                result_1['connect'] = result_1['connect'] || [];
                                result_1['connect'].push(exports.getSubSchemaMutations(item, schema_2, 'create'));
                            }
                            else {
                                item.id = utils_2.generateUUID();
                                result_1['set'] = result_1['set'] || [];
                                result_1['set'].push({ id: item.id });
                                result_1['create'] = result_1['create'] || [];
                                result_1['create'].push(exports.getSubSchemaMutations(item, schema_2, 'create'));
                            }
                        }
                    }
                    else {
                        item.id = utils_2.generateUUID();
                        result_1['set'] = result_1['set'] || [];
                        result_1['set'].push({ id: item.id });
                        result_1['create'] = result_1['create'] || [];
                        //miresult['deleteMany']= [{}]
                        result_1['create'].push(exports.getSubSchemaMutations(item, schema_2, 'create'));
                    }
                });
                if ((result_1 && result_1.create && !result_1.update) || (result_1 && result_1.connect && !result_1.update)) {
                    delete result_1.set;
                }
                obj[key] = result_1;
            }
            else {
                var schema_3 = __1.Schema.getInstance(definition.type);
                //table
                if (value && value.id && Object.keys(value).length === 1) {
                    obj[key] = { connect: { id: value.id } };
                }
                else if (mutationType === 'update') {
                    if (value && value.id) {
                        var id = value.id, clone = __rest(value, ["id"]);
                        obj[key] = {
                            update: exports.getSubSchemaMutations(clone, schema_3, 'update')
                        };
                    }
                    else {
                        var id = value.id, clone = __rest(value, ["id"]);
                        obj[key] = {
                            upsert: {
                                create: exports.getSubSchemaMutations(clone, schema_3, 'create'),
                                update: exports.getSubSchemaMutations(clone, schema_3, 'update')
                            }
                        };
                    }
                }
                else {
                    obj[key] = {
                        create: exports.getSubSchemaMutations(value, schema_3, 'create'),
                    };
                }
            }
        }
        else {
            if (definition.isArray) {
                obj[key] = { set: value };
            }
            else {
                return obj[key] = value;
            }
        }
    });
    return obj;
};
//# sourceMappingURL=Mutate.js.map