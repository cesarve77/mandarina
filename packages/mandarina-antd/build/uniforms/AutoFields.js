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
var prop_types_1 = __importDefault(require("prop-types"));
var filterDOMProps_1 = __importDefault(require("uniforms/filterDOMProps"));
var AutoField_1 = __importDefault(require("./AutoField"));
var antd_1 = require("antd");
var utils_1 = require("mandarina/build/utils");
var AutoFields = /** @class */ (function (_super) {
    __extends(AutoFields, _super);
    function AutoFields() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AutoFields.prototype.componentWillMount = function () {
        var _a = this.context.uniforms, schema = _a.schema, error = _a.error;
        this.fields = this.props.fields || schema.getSubfields();
        var groups = {};
        var groupErrors = [];
        this.fields.forEach(function (field) {
            var _a = schema.getField(field).uniforms, _b = (_a === void 0 ? {} : _a).group, group = _b === void 0 ? 'default' : _b;
            groups[group] = groups[group] || [];
            groups[group].push(field);
            var hasError = !!schema.getError(field, error);
            if (hasError) {
                groupErrors.push(group);
            }
        });
        for (var key in groups) {
            groups[key].sort(function (_a) {
                var _b = _a.uniforms, order = (_b === void 0 ? {} : _b).order;
                return order;
            });
        }
        var groupNames = Object.keys(groups);
        //if (activeKey.length===0) activeKey = [groupNames[0]]
        groupNames.sort(function (groupName) {
            var _a = schema.getField(groups[groupName][0]).uniforms, _b = (_a === void 0 ? {} : _a).order, order = _b === void 0 ? 0 : _b;
            return order;
        });
        this.groups = groups;
        this.groupNames = groupNames;
    };
    AutoFields.prototype.render = function () {
        var _this = this;
        var _a = this.props, autoField = _a.autoField, element = _a.element, fields = _a.fields, _b = _a.omitFields, omitFields = _b === void 0 ? [] : _b, loading = _a.loading, props = __rest(_a, ["autoField", "element", "fields", "omitFields", "loading"]);
        var fieldList = fields || this.fields;
        if (this.groupNames.length > 1)
            return (this.groupNames.map(function (groupName) { return (react_1.default.createElement(antd_1.Row, { key: groupName }, react_1.createElement(element, props, _this.groups[groupName]
                .map(function (field) {
                return react_1.createElement(autoField, { key: field, name: field });
            })))); }));
        var filteredField = fieldList.filter(function (field) { return !omitFields.includes(field); });
        var parents = utils_1.getParentsDot(filteredField);
        return react_1.createElement(element, props, parents
            .map(function (field) {
            var fields = utils_1.getDecendentsDot(filteredField, field);
            if (fields.length > 0) {
                return react_1.createElement(autoField, __assign({ key: field, name: field, fields: fields }, props));
            }
            return react_1.createElement(autoField, __assign({ key: field, name: field }, props));
        }));
    };
    return AutoFields;
}(react_1.Component));
AutoFields.contextTypes = AutoField_1.default.contextTypes;
AutoFields.propTypes = {
    autoField: prop_types_1.default.oneOfType([prop_types_1.default.func, prop_types_1.default.string]),
    element: prop_types_1.default.oneOfType([prop_types_1.default.func, prop_types_1.default.string]),
    fields: prop_types_1.default.arrayOf(prop_types_1.default.string),
    omitFields: prop_types_1.default.arrayOf(prop_types_1.default.string),
};
AutoFields.defaultProps = {
    autoField: AutoField_1.default,
    element: 'div',
};
filterDOMProps_1.default.register('col', 'props');
exports.default = AutoFields;
//# sourceMappingURL=AutoFields.js.map