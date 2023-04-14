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
var connectField_1 = __importDefault(require("uniforms/connectField"));
var filterDOMProps_1 = __importDefault(require("uniforms/filterDOMProps"));
var injectName_1 = __importDefault(require("uniforms/injectName"));
var joinName_1 = __importDefault(require("uniforms/joinName"));
var AutoField_1 = __importDefault(require("./AutoField"));
var utils_1 = require("mandarina/build/utils");
var PropTypes = __importStar(require("prop-types"));
var Nest = /** @class */ (function (_super) {
    __extends(Nest, _super);
    function Nest(props) {
        var _this = _super.call(this, props) || this;
        _this.decendents = {};
        _this.parents = [];
        _this.parents = utils_1.getParentsDot(props.fields);
        _this.parents.forEach(function (parent) {
            _this.decendents[parent] = utils_1.getDecendentsDot(props.fields, parent);
        });
        return _this;
    }
    Nest.prototype.render = function () {
        var _this = this;
        var _a = this.props, children = _a.children, error = _a.error, errorMessage = _a.errorMessage, itemProps = _a.itemProps, label = _a.label, name = _a.name, showInlineError = _a.showInlineError, props = __rest(_a, ["children", "error", "errorMessage", "itemProps", "label", "name", "showInlineError"]);
        return react_1.default.createElement("div", __assign({}, filterDOMProps_1.default(props)),
            label && (react_1.default.createElement("label", null, label)),
            !!(error && showInlineError) && (react_1.default.createElement("div", null, errorMessage)),
            children ? (injectName_1.default(name, children)) : (this.parents.map(function (key) {
                return react_1.default.createElement(AutoField_1.default, __assign({ key: key, name: joinName_1.default(name, key), fields: _this.decendents[key] }, itemProps));
            })));
    };
    return Nest;
}(react_1.Component));
Nest.propTypes = {
    children: PropTypes.any,
    error: PropTypes.any,
    errorMessage: PropTypes.any,
    fields: PropTypes.any,
    itemProps: PropTypes.any,
    label: PropTypes.any,
    name: PropTypes.any,
    showInlineError: PropTypes.any
};
exports.default = connectField_1.default(Nest, { ensureValue: false, includeInChain: false });
//# sourceMappingURL=NestField.js.map