"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var graphql_tag_1 = require("graphql-tag");
var react_apollo_1 = require("react-apollo");
var utils_1 = require("./utils");
var lodash_pull_1 = require("lodash.pull");
var FindBase = /** @class */ (function (_super) {
    __extends(FindBase, _super);
    function FindBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.queryHistory = [];
        _this.buildQueryFromFields = function (fields) { return utils_1.buildQueryFromFields(fields); };
        return _this;
    }
    FindBase.prototype.componentWillUnmount = function () {
        if (!Array.isArray(FindBase.queries))
            return;
        lodash_pull_1.default.apply(void 0, [FindBase.queries].concat(this.queryHistory));
    };
    FindBase.prototype.render = function () {
        var _a;
        FindBase.queries = FindBase.queries || [];
        var _b = this.props, children = _b.children, optionalFields = _b.fields, table = _b.table, after = _b.after, first = _b.first, type = _b.type, where = _b.where, props = __rest(_b, ["children", "fields", "table", "after", "first", "type", "where"]);
        var fields = optionalFields || table.getFields();
        var names = table.names;
        var defaultQuery = this.buildQueryFromFields(fields);
        var queryString;
        if (type === 'connection') {
            queryString = "query ($where: " + names.input.where[type] + ", $after: String, $first: Int) \n            { " + names.query[type] + "  (where: $where, after: $after, first: $first) {\n                pageInfo {\n                  hasNextPage\n                  endCursor\n                }\n                edges {\n                  node  " + defaultQuery + "\n                }\n                aggregate {\n                  count\n                }\n              }    \n            }";
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
        var variables = { where: where, first: first, after: after };
        return (<react_apollo_1.Query query={QUERY} variables={variables} notifyOnNetworkStatusChange fetchPolicy='cache-and-network' partialRefetch {...props}>
                {function (_a) {
            var error = _a.error, data = _a.data, loading = _a.loading, refetch = _a.refetch, fetchMore = _a.fetchMore, restData = __rest(_a, ["error", "data", "loading", "refetch", "fetchMore"]);
            var count, pageInfo;
            if (!error) {
                if (type === 'connection' && data && data[names.query[type]]) {
                    count = data[names.query[type]].aggregate.count;
                    pageInfo = data[names.query[type]].pageInfo;
                    data = data[names.query[type]].edges.map(function (data) { return data.node; });
                }
                else {
                    data = data && data[names.query[type]];
                }
            }
            return children(__assign({ error: error,
                table: table,
                fields: fields,
                data: data,
                fetchMore: fetchMore,
                count: count,
                pageInfo: pageInfo, query: QUERY, loading: loading,
                refetch: refetch }, restData));
        }}
            </react_apollo_1.Query>);
    };
    FindBase.defaultProps = { where: {}, first: 10 };
    return FindBase;
}(react_1.PureComponent));
exports.FindBase = FindBase;
exports.FindOne = function (props) { return <FindBase type='single' {...props}/>; };
exports.Find = function (props) { return <FindBase type='connection' {...props}/>; };
