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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsetDeep = exports.getDefaultComponent = exports.getDefaultFilterMethod = exports.AllOperators = void 0;
var lodash_1 = require("lodash");
var connectField_1 = __importDefault(require("uniforms/connectField"));
var date_picker_1 = __importDefault(require("antd/lib/date-picker"));
var dropdown_1 = __importDefault(require("antd/lib/dropdown"));
var input_1 = __importDefault(require("antd/lib/input"));
var input_number_1 = __importDefault(require("antd/lib/input-number"));
var menu_1 = __importDefault(require("antd/lib/menu"));
var react_1 = __importStar(require("react"));
var mandarina_1 = require("mandarina");
var utils_1 = require("mandarina/build/Schema/utils");
var select_1 = __importDefault(require("antd/lib/select"));
var Option = select_1.default.Option;
var moment_1 = __importDefault(require("moment"));
exports.AllOperators = {
    "": { description: "equals", symbol: "=" },
    "_not": { description: "not equals", symbol: "!=" },
    "_contains": { description: "contains substring", symbol: "~" },
    "_not_contains": { description: "does not contain substring", symbol: "!~" },
    "_starts_with": { description: "starts with", symbol: "^" },
    "_not_starts_with": { description: "does not starts with", symbol: "!^" },
    "_ends_with": { description: "ends with", symbol: "$" },
    "_not_ends_with": { description: "does not ends with", symbol: "!$" },
    "_lt": { description: "less than", symbol: "<" },
    "_lte": { description: "less then or equals", symbol: "<=" },
    "_gt": { description: "greater than", symbol: ">" },
    "_gte": { description: "greater than or equals", symbol: ">=" },
    "_contains_every": { description: "all contains", symbol: "[~]" },
    "_contains_some": { description: "contains at least 1", symbol: "~" },
};
var getDefaultFilterMethod = function (field, schema) {
    var fieldDefinition = schema.getPathDefinition(field);
    var path = field.split('.');
    var originalPath = field.split('.');
    var len = path.length;
    var last = len - 1;
    //filling all parents fields. it must be a table (Relation field)
    for (var i = 0; i < len; i++) {
        var field_1 = originalPath.slice(0, i + 1).join('.');
        var fieldDefinition_1 = schema.getPathDefinition(field_1);
        if (fieldDefinition_1.isArray) {
            if (fieldDefinition_1.isTable) {
                path[i] += '_some';
            }
            else {
                // if the past parent es array, must be a array of scalars
                path[last] += '_contains_some';
                path.push(path[last]);
                last++;
            }
        }
    }
    return function (filter) {
        //todo forzar el tipo de verdad para que si escriben un string donde va un numero no mande el query
        var search = filter.filter;
        var original = path[last];
        if (search !== undefined) {
            var where = {};
            path[last] += filter.operator;
            var value = (0, utils_1.forceType)(search, fieldDefinition.type);
            if (filter.operator === "" && fieldDefinition.type === Date) {
                value = (0, moment_1.default)(value);
                path[last] += "_gte";
                value.startOf('day');
                (0, lodash_1.set)(where, path, value.toDate());
                path[last] = original;
                path[last] += "_lte";
                value.endOf('day');
                (0, lodash_1.set)(where, path, value.toDate());
            }
            else {
                (0, lodash_1.set)(where, path, value);
            }
            path[last] = original;
            return where;
        }
        else {
            return;
        }
    };
};
exports.getDefaultFilterMethod = getDefaultFilterMethod;
var getAvailableOperator = function (type) {
    switch (true) {
        case (type === String):
            return ["_contains", "", "_not", "_not_contains", "_starts_with", "_not_starts_with", "_ends_with", "_not_ends_with"];
        case (type === mandarina_1.Integer || type === Date || type === Number):
            return ["", "_not", "_lt", "_lte", "_gt", "_gte"];
        default:
            return [""];
    }
};
var getDefaultComponent = function (fieldDefinition) {
    var availableOperators = getAvailableOperator(fieldDefinition.type);
    var Filter = function (_a) {
        var _b, _c;
        var _d = _a.value, value = _d === void 0 ? {
            operator: availableOperators[0],
            filter: undefined
        } : _d, onChange = _a.onChange;
        var clonedValue = __assign({}, value);
        if (!clonedValue || (!clonedValue.operator && clonedValue.operator !== "")) {
            clonedValue = { operator: availableOperators[0], filter: undefined };
        }
        var _e = (0, react_1.useState)(clonedValue.operator), selected = _e[0], setSelected = _e[1];
        var options = (react_1.default.createElement(menu_1.default, { onClick: function (_a) {
                var operator = _a.key;
                if (operator === "_") {
                    operator = "";
                }
                setSelected(operator);
                if (clonedValue.filter) {
                    onChange(clonedValue);
                }
            } }, availableOperators.map(function (operator) {
            return react_1.default.createElement(menu_1.default.Item, { key: operator || "_" },
                " ",
                exports.AllOperators[operator].symbol,
                " ",
                ' ',
                " ",
                exports.AllOperators[operator].description);
        })));
        var operator = (availableOperators.length > 1) ? (react_1.default.createElement(dropdown_1.default, { overlay: options },
            react_1.default.createElement("a", { className: "ant-dropdown-link" }, exports.AllOperators[selected].symbol))) : undefined;
        var type = fieldDefinition.type, validators = fieldDefinition.validators;
        var hasOptions = (0, utils_1.hasValidator)(validators, 'isAllowed');
        switch (true) {
            case (type === mandarina_1.Integer):
                return (react_1.default.createElement("span", { className: "ant-input-wrapper ant-input-group" },
                    react_1.default.createElement("span", { className: "ant-input-group-addon" }, operator),
                    react_1.default.createElement(input_number_1.default, { value: clonedValue.filter, style: { width: '100%' }, onChange: function (value) { return (value === 0 || value) ? onChange({
                            operator: selected,
                            filter: value
                        }) : onChange(null); } })));
            case (type === Number):
                return (react_1.default.createElement("span", { className: "ant-input-wrapper ant-input-group" },
                    react_1.default.createElement("span", { className: "ant-input-group-addon" }, operator),
                    react_1.default.createElement(input_number_1.default, { value: clonedValue.filter, style: { width: '100%' }, onChange: function (value) { return (value === 0 || value) ? onChange({
                            operator: selected,
                            filter: value
                        }) : onChange(null); } })));
            case (type === Date):
                return (react_1.default.createElement("span", { className: "ant-input-wrapper ant-input-group date-picker" },
                    react_1.default.createElement("span", { className: "ant-input-group-addon" }, operator),
                    react_1.default.createElement(date_picker_1.default, { value: clonedValue.filter ? (0, moment_1.default)(clonedValue.filter) : undefined, placeholder: "", onChange: function (date) { return date ? onChange({
                            operator: selected,
                            filter: (0, moment_1.default)(date)
                        }) : onChange(null); } })));
            case (type === Boolean):
                var selectValue = clonedValue.filter === false ? 'false' : clonedValue.filter ? 'true' : undefined;
                return (react_1.default.createElement(select_1.default, { value: selectValue, allowClear: true, style: { width: '100%' }, onChange: function (value) {
                        if (!value)
                            return onChange(null);
                        onChange({
                            operator: selected,
                            filter: value === 'true'
                        });
                    } },
                    react_1.default.createElement(Option, { value: 'true' }, "Yes"),
                    react_1.default.createElement(Option, { value: 'false' }, "No")));
            case (type === String && hasOptions):
                var isAllowed = validators.find(function (validator) { return validator.validatorName === 'isAllowed'; });
                if (!isAllowed) {
                    return null;
                }
                var transform_1 = (_c = (_b = fieldDefinition === null || fieldDefinition === void 0 ? void 0 : fieldDefinition.form) === null || _b === void 0 ? void 0 : _b.props) === null || _c === void 0 ? void 0 : _c.transform;
                return (react_1.default.createElement(select_1.default, { value: clonedValue.filter, allowClear: true, style: { width: '100%' }, onChange: function (value) {
                        if (!value)
                            return onChange(null);
                        onChange({
                            operator: "",
                            filter: value
                        });
                    } }, isAllowed.param.map(function (param) { return react_1.default.createElement(Option, { key: param, value: param }, transform_1 ? transform_1(param) : param); })));
            default:
                return react_1.default.createElement(input_1.default, { addonBefore: operator, value: clonedValue.filter, style: { width: '100%' }, onChange: function (_a) {
                        var value = _a.target.value;
                        return value ? onChange({
                            operator: selected,
                            filter: value
                        }) : onChange(null);
                    } });
        }
    };
    return (0, connectField_1.default)(Filter, {
        includeInChain: true,
        ensureValue: true,
        initialValue: true,
    });
};
exports.getDefaultComponent = getDefaultComponent;
var unsetDeep = function (obj, path) {
    (0, lodash_1.unset)(obj, path);
    path.pop();
    while (path.length) {
        var value = (0, lodash_1.get)(obj, path);
        if (value && (0, lodash_1.isEmpty)(value))
            (0, lodash_1.unset)(obj, path);
        path.pop();
    }
};
exports.unsetDeep = unsetDeep;
//# sourceMappingURL=ListFilters.js.map