"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var BaseField_1 = __importDefault(require("uniforms/BaseField"));
var react_1 = __importDefault(require("react"));
var filterDOMProps_1 = __importDefault(require("uniforms/filterDOMProps"));
var nothing_1 = __importDefault(require("uniforms/nothing"));
var HiddenTableField = /** @class */ (function (_super) {
    __extends(HiddenTableField, _super);
    function HiddenTableField() {
        var _this = _super.apply(this, arguments) || this;
        _this.options = {
            ensureValue: true,
            overrideValue: true
        };
        return _this;
    }
    HiddenTableField.prototype.componentWillReceiveProps = function (_a) {
        var valueDesired = _a.value;
        if (valueDesired === undefined) {
            return;
        }
        var props = this.getFieldProps();
        if (props.value !== valueDesired) {
            props.onChange({ id: valueDesired });
        }
    };
    HiddenTableField.prototype.render = function () {
        var props = this.getFieldProps();
        var value = props.value && props.value.id;
        return props.noDOM ? (nothing_1.default) : (react_1.default.createElement("input", __assign({ disabled: props.disabled, id: props.id, name: props.name, ref: props.inputRef, type: "hidden", value: value || '' }, (0, filterDOMProps_1.default)(props))));
    };
    HiddenTableField.displayName = 'HiddenTableField';
    return HiddenTableField;
}(BaseField_1.default));
exports.default = HiddenTableField;
//# sourceMappingURL=HiddenTableField.js.map