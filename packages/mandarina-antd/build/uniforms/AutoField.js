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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var antd_1 = require("antd");
var BaseField_1 = __importDefault(require("uniforms/BaseField"));
var NumField_1 = __importDefault(require("uniforms-antd/NumField"));
var BoolField_1 = __importDefault(require("uniforms-antd/BoolField"));
var DateField_1 = __importDefault(require("uniforms-antd/DateField"));
var TextField_1 = __importDefault(require("uniforms-antd/TextField"));
var SelectField_1 = __importDefault(require("uniforms-antd/SelectField"));
var RadioField_1 = __importDefault(require("uniforms-antd/RadioField"));
var ListField_1 = __importDefault(require("./ListField"));
var NestField_1 = __importDefault(require("./NestField"));
var TableField_1 = __importDefault(require("./TableField"));
var invariant_1 = __importDefault(require("invariant"));
var mandarina_1 = require("mandarina");
var HiddenField_1 = __importDefault(require("uniforms-antd/HiddenField"));
var filterDOMProps_1 = __importDefault(require("uniforms/filterDOMProps"));
filterDOMProps_1.default.register('col', 'loading', 'minCount', 'maxCount', 'fields', 'submitting', 'validating', 'fieldDefinition');
var CustomAuto = /** @class */ (function (_super) {
    __extends(CustomAuto, _super);
    function CustomAuto() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CustomAuto.prototype.getChildContextName = function () {
        return this.context.uniforms.name;
    };
    CustomAuto.prototype.render = function () {
        var props = this.getFieldProps(undefined, { ensureValue: false });
        if (props.component === undefined) {
            if (props.allowedValues) { //todo
                if (props.checkboxes && props.fieldType !== Array) {
                    props.component = RadioField_1.default;
                }
                else {
                    props.component = SelectField_1.default;
                }
            }
            else {
                switch (true) {
                    case /(^id$|\.id$)/.test(this.props.name):
                        props.component = HiddenField_1.default;
                        break;
                    case !!props.query:
                        props.component = TableField_1.default;
                        break;
                    case (Array.isArray(props.fieldType) || props.fieldType === Array):
                        props.component = ListField_1.default;
                        break;
                    case (typeof props.fieldType === 'string' || props.fieldType === Object):
                        props.component = NestField_1.default;
                        break;
                    case props.fieldType === Date:
                        props.component = DateField_1.default;
                        break;
                    case props.fieldType === Number:
                        props.component = NumField_1.default;
                        break;
                    case props.fieldType === mandarina_1.Integer:
                        props.component = NumField_1.default;
                        break;
                    case props.fieldType === String:
                        props.component = TextField_1.default;
                        break;
                    case props.fieldType === Boolean:
                        props.component = BoolField_1.default;
                        break;
                }
                (0, invariant_1.default)(props.component, 'Unsupported field type in: %s', props.name);
            }
        }
        //this.props  properties applied directly on AutoField
        //props has a field property with values in the schema
        var mergeProps = __assign(__assign({}, this.props), props.field.form.props);
        if (mergeProps.col === false)
            return (0, react_1.createElement)(props.component, mergeProps);
        var col = typeof mergeProps.col !== 'object' ? { span: mergeProps.col || 24 } : mergeProps.col ? __assign({}, mergeProps.col) : { span: 24 };
        return (react_1.default.createElement(antd_1.Col, __assign({}, col, { "data-id": mergeProps.name }), (0, react_1.createElement)(props.component, mergeProps)));
    };
    CustomAuto.displayName = 'CustomAutoField';
    return CustomAuto;
}(BaseField_1.default));
;
exports.default = CustomAuto;
//# sourceMappingURL=AutoField.js.map