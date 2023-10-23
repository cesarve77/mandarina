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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinValues = void 0;
var react_apollo_1 = require("react-apollo");
var react_1 = __importDefault(require("react"));
var graphql_tag_1 = __importDefault(require("graphql-tag"));
var SelectField_1 = __importDefault(require("uniforms-antd/SelectField"));
var antd_1 = require("antd");
var mandarina_1 = require("mandarina");
var connectField_1 = __importDefault(require("uniforms/connectField"));
var lodash_1 = require("lodash");
var defaultLabeler = function (doc) {
    var clone = __assign({}, doc);
    var id = clone.id;
    delete clone.id;
    delete clone.__typename;
    return (0, exports.joinValues)(clone, id);
};
var getTransform = function (docs, labeler) {
    if (!Array.isArray(docs) || docs.length === 0)
        return function (id) { return id; };
    var mapper = {};
    docs.forEach(function (doc) {
        mapper[doc.id] = labeler(doc);
    });
    return function (id) { return mapper[id] && mapper[id].toString(); };
};
var joinValues = function (obj, defaultValue, divider) {
    if (divider === void 0) { divider = ' '; }
    if (!obj)
        return defaultValue;
    if (typeof obj === 'string')
        return obj;
    var keys = Object.keys(obj);
    if (!keys[0])
        return defaultValue;
    var result = [];
    keys.forEach(function (key) {
        if (obj[key] === 'object') {
            return result.push((0, exports.joinValues)(obj[key]));
        }
        else {
            return result.push(obj[key]);
        }
    });
    return result.join(divider);
};
exports.joinValues = joinValues;
var Table = function (_a) {
    var query = _a.query, where = _a.where, mode = _a.mode, _b = _a.labeler, labeler = _b === void 0 ? defaultLabeler : _b, props = __rest(_a, ["query", "where", "mode", "labeler"]);
    var table = (props && props.type) || props.field.type;
    if (typeof query === 'string') {
        var schema = mandarina_1.Schema.getInstance(table);
        var queryName_1 = schema.names.query.plural;
        var inputName = schema.names.input.where.plural;
        var QUERY = (0, graphql_tag_1.default)("query ".concat(queryName_1, "($where: ").concat(inputName, ") {").concat(queryName_1, " (where: $where) { id ").concat(query, " }}"));
        return (react_1.default.createElement(react_apollo_1.Query, { query: QUERY, variables: { where: where } }, function (_a) {
            var loading = _a.loading, error = _a.error, data = _a.data, variables = _a.variables, refetch = _a.refetch;
            if (error)
                throw error;
            var docs = loading || !data || !Array.isArray(data[queryName_1]) ? [] : data[queryName_1];
            var allowedValues = docs.map(function (_a) {
                var id = _a.id;
                return id;
            });
            var transform = getTransform(docs, labeler);
            var mode = props.mode, value;
            var onChange = function (value) { return props.onChange({ id: value }); };
            if (props.field.isArray) {
                mode = props.mode || "multiple";
                value = props.value && props.value.map(function (_a) {
                    var id = _a.id;
                    return id;
                });
                onChange = function (values) {
                    props.onChange(values && values.map(function (id) { return ({ id: id }); }));
                };
            }
            else {
                value = props.value && props.value.id;
                if ((0, lodash_1.isEmpty)(value))
                    value = null;
            }
            return react_1.default.createElement(SelectField_1.default, __assign({}, props, { filterOption: function (input, option) {
                    return option.props.children.match(new RegExp(input, 'i'));
                }, mode: mode, transform: transform, placeholder: props.loading ? '.... ... .. .' : props.placeholder, disabled: loading || props.disabled, onChange: onChange, value: value, notFoundContent: loading ? react_1.default.createElement(antd_1.Spin, { size: "small" }) : null, allowedValues: allowedValues }));
        }));
    }
    else {
    }
};
exports.default = (0, connectField_1.default)(Table, {
    ensureValue: false,
    includeInChain: false,
    initialValue: true
});
//# sourceMappingURL=TableField.js.map