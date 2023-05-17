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
var react_resizable_1 = require("react-resizable");
var React = __importStar(require("react"));
var ListFilter_1 = __importDefault(require("./ListFilter"));
var ListHeader = function (_a) {
    var field = _a.field, onResize = _a.onResize, onFilterChange = _a.onFilterChange, overwrite = _a.overwrite, width = _a.width, schema = _a.schema, children = _a.children, fieldDefinition = _a.fieldDefinition, rest = __rest(_a, ["field", "onResize", "onFilterChange", "overwrite", "width", "schema", "children", "fieldDefinition"]);
    if (!width)
        return (React.createElement("th", __assign({}, rest),
            children,
            onFilterChange &&
                React.createElement(ListFilter_1.default, { field: field, overwrite: overwrite, schema: schema, onFilterChange: onFilterChange })));
    return (React.createElement(react_resizable_1.Resizable, { width: width, overwrite: overwrite, height: 0, onResize: onResize },
        React.createElement("th", __assign({}, rest),
            children,
            onFilterChange &&
                React.createElement(ListFilter_1.default, { field: field, schema: schema, onFilterChange: onFilterChange }))));
};
exports.default = ListHeader;
//# sourceMappingURL=ListHeader.js.map