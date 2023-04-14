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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var icon_1 = __importDefault(require("antd/lib/icon"));
var react_1 = __importStar(require("react"));
var tooltip_1 = __importDefault(require("antd/lib/tooltip"));
var connectField_1 = __importDefault(require("uniforms/connectField"));
var filterDOMProps_1 = __importDefault(require("uniforms/filterDOMProps"));
var joinName_1 = __importDefault(require("uniforms/joinName"));
var ListAddField_1 = __importDefault(require("uniforms-antd/ListAddField"));
var ListItemField_1 = __importDefault(require("./ListItemField"));
var List = function (_a) {
    var children = _a.children, error = _a.error, errorMessage = _a.errorMessage, info = _a.info, initialCount = _a.initialCount, itemProps = _a.itemProps, label = _a.label, labelCol = _a.labelCol, name = _a.name, showInlineError = _a.showInlineError, value = _a.value, wrapperCol = _a.wrapperCol, fields = _a.fields, _b = _a.showAddField, showAddField = _b === void 0 ? true : _b, addLabel = _a.addLabel, props = __rest(_a, ["children", "error", "errorMessage", "info", "initialCount", "itemProps", "label", "labelCol", "name", "showInlineError", "value", "wrapperCol", "fields", "showAddField", "addLabel"]);
    return react_1.default.createElement("div", __assign({}, filterDOMProps_1.default(props)),
        !!label && (react_1.default.createElement("div", null,
            label,
            !!info && (react_1.default.createElement("span", null,
                "\u00A0",
                react_1.default.createElement(tooltip_1.default, { title: info },
                    react_1.default.createElement(icon_1.default, { type: "question-circle-o" })))))),
        !!(error && showInlineError) && (react_1.default.createElement("div", null, errorMessage)),
        children ? (value.map(function (item, index) {
            return react_1.Children.map(children, function (child) {
                return react_1.default.cloneElement(child, {
                    key: index,
                    index: index,
                    label: null,
                    name: joinName_1.default(name, child.props.name && child.props.name.replace('$', index)),
                });
            });
        })) : (value.map(function (item, index) {
            return react_1.default.createElement(ListItemField_1.default, __assign({ key: index, index: index, label: null, labelCol: labelCol, name: joinName_1.default(name, index), "data-id": "list-item-" + joinName_1.default(name, index), wrapperCol: wrapperCol, fields: fields }, itemProps));
        })),
        showAddField && react_1.default.createElement("div", { style: { clear: 'both' } },
            react_1.default.createElement(ListAddField_1.default, { name: name + ".$", initialCount: initialCount, size: 'large', className: 'add-button', type: 'primary', shape: 'round', "data-id": "list-add-" + name, style: {} }, addLabel ? addLabel : "Add " + label)),
        react_1.default.createElement("div", { style: { clear: 'both' } }));
};
List.defaultProps = {
    style: {
        border: '1px solid #DDD',
        borderRadius: '7px',
        marginBottom: '5px',
        marginTop: '5px',
        padding: '10px'
    }
};
exports.default = connectField_1.default(List, { ensureValue: true, includeInChain: false });
//# sourceMappingURL=ListField.js.map