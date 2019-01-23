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
exports.AuthTable = function (_a) {
    var action = _a.action, schema = _a.schema, children = _a.children, props = __rest(_a, ["action", "schema", "children"]);
    var table = schema.name;
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
exports.default = exports.AuthTable;
exports.addToSet = function (into, toBeAdded) { return toBeAdded.forEach(function (item) { return !into.includes(item) && into.push(item); }); };
var templateObject_1;
