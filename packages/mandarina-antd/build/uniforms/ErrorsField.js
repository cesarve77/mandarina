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
var BaseField_1 = __importDefault(require("uniforms/BaseField"));
var react_1 = __importDefault(require("react"));
var filterDOMProps_1 = __importDefault(require("uniforms/filterDOMProps"));
var nothing_1 = __importDefault(require("uniforms/nothing"));
var ErrorsField = function (_a, _b) {
    var children = _a.children, props = __rest(_a, ["children"]);
    var _c = _b.uniforms, error = _c.error, schema = _c.schema;
    return (!error && !children) ? nothing_1.default : (react_1.default.createElement("div", __assign({}, (0, filterDOMProps_1.default)(props)),
        react_1.default.createElement("div", { style: { clear: 'both' } }),
        children,
        react_1.default.createElement("div", { dataShow: "true", className: "ant-alert ant-alert-error ant-alert-with-description" },
            react_1.default.createElement("i", { className: "anticon anticon-close-circle ant-alert-icon" },
                react_1.default.createElement("svg", { viewBox: "64 64 896 896", className: "", "data-icon": "close-circle", width: "1em", height: "1em", fill: "currentColor", "aria-hidden": "true" },
                    react_1.default.createElement("path", { d: "M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 0 0-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z" }),
                    react_1.default.createElement("path", { d: "M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" }))),
            react_1.default.createElement("ul", null, schema.getErrorMessages(error).map(function (message, index) {
                return react_1.default.createElement("li", { key: index, className: "ant-alert-description" }, message);
            }))),
        react_1.default.createElement("div", { style: { clear: 'both' } })));
};
ErrorsField.contextTypes = BaseField_1.default.contextTypes;
exports.default = ErrorsField;
//# sourceMappingURL=ErrorsField.js.map