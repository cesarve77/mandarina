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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var react_1 = __importStar(require("react"));
var connectField_1 = __importDefault(require("uniforms/connectField"));
var joinName_1 = __importDefault(require("uniforms/joinName"));
var AutoField_1 = __importDefault(require("./AutoField"));
var ListDelField_1 = __importDefault(require("uniforms-antd/ListDelField"));
var ListItem = function (_a) {
    var children = _a.children, _b = _a.showListDelField, showListDelField = _b === void 0 ? true : _b, name = _a.name, index = _a.index, props = __rest(_a, ["children", "showListDelField", "name", "index"]);
    return (react_1.default.createElement("div", { style: { width: '100%', clear: 'both', float: "none" } },
        react_1.default.createElement("div", { style: {
                float: 'right',
                marginBottom: '10px',
                marginLeft: '10px',
                marginRight: '6px',
                width: '20px'
            } }, (typeof showListDelField === 'function' ? showListDelField({ index: index, name: name }) : showListDelField) &&
            react_1.default.createElement(ListDelField_1.default, { className: "top aligned", name: name, type: "danger" })),
        react_1.default.createElement("div", { style: { marginBottom: '4px', overflow: 'hidden' } },
            react_1.default.createElement("div", { style: { borderBottom: '1px solid #adadad', height: '20px', marginTop: '-4px' } })),
        react_1.default.createElement("div", { style: { width: '100%', clear: 'both' } }, children ? (typeof children === 'function' ?
            react_1.Children.map(children(__assign({ children: children, showListDelField: showListDelField, name: name, index: index }, props)), function (child) {
                return react_1.default.cloneElement(child, {
                    index: index,
                    name: (0, joinName_1.default)(name, child.name),
                    label: null
                });
            })
            :
                react_1.Children.map(children, function (child) {
                    return react_1.default.cloneElement(child, {
                        index: index,
                        name: (0, joinName_1.default)(name, child.name),
                        label: null
                    });
                })) : (react_1.default.createElement(AutoField_1.default, __assign({}, __assign({ children: children, showListDelField: showListDelField, name: name, index: index }, props)))))));
};
exports.default = (0, connectField_1.default)(ListItem, { includeInChain: false, includeParent: true });
//# sourceMappingURL=ListItemField.js.map