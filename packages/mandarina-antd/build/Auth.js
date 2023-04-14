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
var react_1 = __importDefault(require("react"));
var mandarina_1 = require("mandarina");
var Forms_1 = require("./Forms");
var spin_1 = __importDefault(require("antd/lib/spin"));
var ListVirtualized_1 = require("./List/ListVirtualized");
var List_1 = require("./List/List");
var AuthAntD = function (_a) {
    var Component = _a.Component, innerRef = _a.innerRef, schema = _a.schema, _b = _a.denied, denied = _b === void 0 ? null : _b, _c = _a.userRoles, userRoles = _c === void 0 ? [] : _c, action = _a.action, fieldsOri = _a.fields, Error = _a.Error, props = __rest(_a, ["Component", "innerRef", "schema", "denied", "userRoles", "action", "fields", "Error"]);
    return (
    // @ts-ignore
    react_1.default.createElement(mandarina_1.Auth, { schema: schema, action: action, userRoles: userRoles, fields: fieldsOri }, function (_a) {
        var fields = _a.fields, loading = _a.loading, error = _a.error, readFields = _a.readFields;
        if (error && Error)
            return react_1.default.createElement(Error, { error: error });
        if (!loading && fields && fields.length === 0)
            return denied;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            loading && react_1.default.createElement(spin_1.default, { spinning: loading, style: { width: '100%', height: '100%' } }),
            !loading && fields && react_1.default.createElement(Component, __assign({ ref: innerRef, schema: schema }, props, { fields: fields, readFields: readFields }))));
    }));
};
exports.AuthUpdateForm = function (props) {
    return react_1.default.createElement(AuthAntD, __assign({ action: 'update', Component: Forms_1.UpdateForm }, props));
};
exports.AuthCreateForm = function (props) {
    return react_1.default.createElement(AuthAntD, __assign({ action: 'create', Component: Forms_1.CreateForm }, props));
};
exports.AuthList = function (props) {
    return react_1.default.createElement(AuthAntD, __assign({ action: 'read', Component: List_1.List }, props));
};
exports.AuthListVirtualized = function (props) {
    return react_1.default.createElement(AuthAntD, __assign({ action: 'read', Component: ListVirtualized_1.ListVirtualized }, props));
};
//# sourceMappingURL=Auth.js.map