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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var __1 = require("..");
var graphql_tag_1 = require("graphql-tag");
var react_apollo_1 = require("react-apollo");
var utils_1 = require("./utils");
var Find_1 = require("./Find");
var utils_2 = require("../utils");
exports.deepClone = function (obj) { return JSON.parse(JSON.stringify(obj)); };
var Mutate = /** @class */ (function (_super) {
    __extends(Mutate, _super);
    function Mutate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.buildQueryFromFields = function () { return utils_1.buildQueryFromFields(_this.props.fields || _this.props.schema.getFields()); };
        _this.refetchQueries = function (mutationResult) {
            return exports.refetchQueries(mutationResult, _this.props.schema, _this.props.client, _this.props.refetchSchemas);
            /*if (this.props.type === 'update') return //for updates the cache is automatic updated by apollo
    
            const {schema: {names}} = this.props;
            const doc = data && data[names.mutation.create]
            if (!Array.isArray(FindBase.queries)) return //no quiries to update
            FindBase.queries.forEach((cachedQuery) => {
                const cachedQueryName = Object.keys(cachedQuery)[0]
                const where = cachedQuery[cachedQueryName]
                const docIsInQuery = evalWhere(doc, where)
    
                if (cachedQueryName === names.query.plural && docIsInQuery) {
                    const QUERY = gql(`query ($where: ${names.input.where.plural} ) { ${names.query.plural}  (where: $where) ${this.query} }`)
                    let docs
                    try {
                        const cache = proxy.readQuery({query: QUERY, variables: {where}});
                        docs = cache && cache[names.query.plural]
                    } catch (e) {
                        console.error('error')
                        docs = []
                    }
                    proxy.writeQuery({
                        query: QUERY,
                        variables: {where},
                        data: {[names.query.plural]: docs.concat([doc])}
                    });
    
                }
            })*/
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
                var definition = schema.getFieldDefinition(key);
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
        var _this = this;
        var wrapper = function (result) { return result; };
        var initiator = function (obj, schema) {
            var res = {
                __typename: schema.name
            };
            if (schema.keys.includes('id')) {
                res.id = _this.props.type === 'update' ? obj.id : '';
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
        schema.clean(cleaned, this.filteredFields); // fill null all missing keys
        var data = this.getSubSchemaMutations(cleaned, schema);
        var mutation = { variables: { data: data } };
        if (type === 'update') {
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
        var _a = this.props, type = _a.type, children = _a.children, schema = _a.schema, optionalFields = _a.fields, omitFields = _a.omitFields, omitFieldsRegEx = _a.omitFieldsRegEx, findLoading = _a.loading, variables = _a.variables, update = _a.update, ignoreResults = _a.ignoreResults, optimisticResponse = _a.optimisticResponse, _b = _a.refetchQueries, refetchQueries = _b === void 0 ? this.refetchQueries : _b, awaitRefetchQueries = _a.awaitRefetchQueries, onCompleted = _a.onCompleted, onError = _a.onError, context = _a.context, client = _a.client, doc = _a.doc, fetchPolicy = _a.fetchPolicy;
        var fields = utils_2.filterFields(schema.getFields(), optionalFields, omitFields, omitFieldsRegEx);
        this.filteredFields = fields;
        var names = schema.names;
        this.query = fields ? utils_1.buildQueryFromFields(fields) : this.buildQueryFromFields();
        var queryString;
        if (type === 'update') {
            queryString = "mutation mutationFn($where: " + names.input.where.single + ", $data: " + names.input[type] + " ) { " + names.mutation[type] + "(data: $data, where: $where) " + this.query + " }";
        }
        else {
            queryString = "mutation mutationFn($data: " + names.input[type] + " ) { " + names.mutation[type] + "(data: $data) " + this.query + " }";
        }
        var MUTATION = graphql_tag_1.default(queryString);
        return (<react_apollo_1.Mutation mutation={MUTATION} refetchQueries={refetchQueries} variables={variables} update={update} ignoreResults={ignoreResults} optimisticResponse={optimisticResponse} awaitRefetchQueries={awaitRefetchQueries} onCompleted={onCompleted} onError={onError} context={context} client={client} fetchPolicy={fetchPolicy}>
                {function (mutationFn, _a) {
            var loading = _a.loading, data = _a.data, error = _a.error, called = _a.called, client = _a.client;
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
        }}
            </react_apollo_1.Mutation>);
    };
    return Mutate;
}(react_1.PureComponent));
exports.Mutate = Mutate;
var MutateWithApollo = react_apollo_1.withApollo(Mutate);
exports.Create = function (_a) {
    var schema = _a.schema, optimisticResponse = _a.optimisticResponse, props = __rest(_a, ["schema", "optimisticResponse"]);
    return (<MutateWithApollo type='create' schema={schema} optimisticResponse={optimisticResponse} {...props}/>);
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
    return (<Find_1.FindOne schema={schema} where={where} fields={fields} {...props}>
            {function (_a) {
        var data = _a.data, findOneProps = __rest(_a, ["data"]);
        return (<MutateWithApollo where={where} type='update' schema={schema} doc={data} optimisticResponse={optimisticResponse} {...findOneProps}>
                        {children}
                    </MutateWithApollo>);
    }}
        </Find_1.FindOne>);
};
exports.refetchQueries = function (mutationResult, schema, client, refetchSchemas) {
    if (refetchSchemas === void 0) { refetchSchemas = []; }
    var refetchQueries = [];
    var _a = schema.names.query, single = _a.single, plural = _a.plural, connection = _a.connection;
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
        var definition = schema.getFieldDefinition(key);
        //1 to n relations
        if (definition.isTable) {
            if (definition.isArray) {
                var schema_2 = __1.Schema.getInstance(definition.type);
                if (!Array.isArray(value)) {
                    obj[key] = null;
                }
                var result_1 = {};
                if (value.length === 0 && mutationType === 'update')
                    result_1.set = [];
                value.forEach(function (item) {
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
                            result_1['create'] = result_1['create'] || [];
                            result_1['create'].push(exports.getSubSchemaMutations(item, schema_2, 'create'));
                        }
                    }
                    else {
                        result_1['create'] = result_1['create'] || [];
                        result_1['create'].push(exports.getSubSchemaMutations(item, schema_2, 'create'));
                    }
                });
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
                        obj[key] = {
                            upsert: {
                                create: exports.getSubSchemaMutations(value, schema_3, 'create'),
                                update: exports.getSubSchemaMutations(value, schema_3, 'update')
                            }
                        };
                    }
                }
                else {
                    obj[key] = { create: exports.getSubSchemaMutations(value, schema_3, 'create') };
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
