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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var graphql_tag_1 = require("graphql-tag");
var react_apollo_1 = require("react-apollo");
var utils_1 = require("./utils");
var lodash_1 = require("lodash");
var FindBase = /** @class */ (function (_super) {
    __extends(FindBase, _super);
    function FindBase(props) {
        var _this = _super.call(this, props) || this;
        _this.queryHistory = [];
        _this.buildQueryFromFields = function (fields) { return utils_1.buildQueryFromFields(fields); };
        FindBase.queries = FindBase.queries || [];
        return _this;
        //todo: **1
    }
    FindBase.prototype.componentWillUnmount = function () {
        if (!Array.isArray(FindBase.queries))
            return;
        lodash_1.pull.apply(void 0, [FindBase.queries].concat(this.queryHistory));
    };
    FindBase.prototype.render = function () {
        var _a;
        var _this = this;
        var _b = this.props, fields = _b.fields, schema = _b.schema, after = _b.after, first = _b.first, type = _b.type, where = _b.where, skip = _b.skip, sort = _b.sort, children = _b.children, pollInterval = _b.pollInterval, notifyOnNetworkStatusChange = _b.notifyOnNetworkStatusChange, fetchPolicy = _b.fetchPolicy, errorPolicy = _b.errorPolicy, ssr = _b.ssr, displayName = _b.displayName, onCompleted = _b.onCompleted, onError = _b.onError, context = _b.context, partialRefetch = _b.partialRefetch, having = _b.having, props = __rest(_b, ["fields", "schema", "after", "first", "type", "where", "skip", "sort", "children", "pollInterval", "notifyOnNetworkStatusChange", "fetchPolicy", "errorPolicy", "ssr", "displayName", "onCompleted", "onError", "context", "partialRefetch", "having"]);
        var orderBy;
        if (sort) {
            var field = Object.keys(sort)[0];
            orderBy = field + (sort[field] > 0 ? '_ASC' : '_DESC');
        }
        var names = schema.names;
        var defaultQuery = utils_1.insertHaving(this.buildQueryFromFields(fields.filter(function (field) { return _this.props.schema.hasPath(field); })), having);
        var queryString;
        if (type === 'connection') {
            queryString = "query ($where: " + names.input.where[type] + ", $after: String, $first: Int, $skip: Int, $orderBy: " + names.orderBy + ") \n            { " + names.query[type] + " (where: $where, after: $after, first: $first, skip: $skip, orderBy: $orderBy) {\n                pageInfo {\n                  hasNextPage\n                  hasPreviousPage\n                  startCursor\n                  endCursor\n                }\n                edges {\n                  node  " + defaultQuery + "\n                }\n              }\n              totalCount: " + names.query[type] + " (where: $where) {\n                aggregate {\n                  count\n                }\n              }    \n            }";
        }
        else {
            queryString = "query ($where: " + names.input.where[type] + " ) { " + names.query[type] + "  (where: $where) " + defaultQuery + " }";
        }
        var QUERY = graphql_tag_1.default(queryString);
        // save a rendered query history in the instance and in the class
        // for update cache queries on mutations
        var query = (_a = {}, _a[names.input[type]] = where, _a);
        this.queryHistory.push(query);
        FindBase.queries.push(query); //save queries to update cache purposes
        var variables = { where: where, first: first, after: after, skip: skip, orderBy: orderBy };
        return (<react_apollo_1.Query query={QUERY} variables={variables} pollInterval={pollInterval} notifyOnNetworkStatusChange={notifyOnNetworkStatusChange} fetchPolicy={fetchPolicy} errorPolicy={errorPolicy} ssr={ssr} displayName={displayName} onCompleted={onCompleted} onError={onError} context={context} partialRefetch={partialRefetch}>
                {function (_a) {
            var error = _a.error, data = _a.data, loading = _a.loading, variables = _a.variables, networkStatus = _a.networkStatus, refetch = _a.refetch, fetchMore = _a.fetchMore, startPolling = _a.startPolling, stopPolling = _a.stopPolling, subscribeToMore = _a.subscribeToMore, updateQuery = _a.updateQuery, client = _a.client;
            var count, pageInfo;
            if (!error) {
                if (type === 'connection' && data && data[names.query[type]]) {
                    count = data["totalCount"].aggregate.count;
                    pageInfo = data[names.query[type]].pageInfo;
                    data = data[names.query[type]].edges.map(function (data) { return data.node; });
                }
                else {
                    data = data && data[names.query[type]];
                }
            }
            else {
                console.error(error);
            }
            if (!children)
                return null;
            return children(__assign({ schema: schema, query: QUERY, data: data,
                loading: loading,
                error: error,
                variables: variables,
                networkStatus: networkStatus,
                fields: fields,
                fetchMore: fetchMore,
                count: count,
                pageInfo: pageInfo,
                refetch: refetch,
                startPolling: startPolling,
                stopPolling: stopPolling,
                subscribeToMore: subscribeToMore,
                updateQuery: updateQuery,
                client: client }, props));
        }}
            </react_apollo_1.Query>);
    };
    FindBase.defaultProps = { where: {}, first: 50 };
    return FindBase;
}(react_1.PureComponent));
exports.FindBase = FindBase;
exports.FindOne = function (props) { return <FindBase type='single' {...props}/>; };
exports.Find = function (props) { return <FindBase type='connection' {...props}/>; };
