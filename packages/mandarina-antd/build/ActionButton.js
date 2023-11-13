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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var React = __importStar(require("react"));
var react_apollo_1 = require("react-apollo");
var graphql_tag_1 = __importDefault(require("graphql-tag"));
var mandarina_1 = require("mandarina");
var utils_1 = require("mandarina/build/Operations/utils");
var Mutate_1 = require("mandarina/build/Operations/Mutate");
var button_1 = __importDefault(require("antd/lib/button"));
var utils_2 = require("mandarina/build/Schema/utils");
var ActionButton = /** @class */ (function (_super) {
    __extends(ActionButton, _super);
    function ActionButton(props) {
        var _this = _super.call(this, props) || this;
        _this.refetchQueries = function (mutationResult) {
            var schema = mandarina_1.Schema.instances[_this.schemaName];
            return (0, Mutate_1.refetchQueries)(mutationResult, _this.props.client, _this.props.refetchSchemas, schema);
        };
        _this.schemaName = _this.props.result.replace(/[\[\]\!]/g, '');
        return _this;
    }
    ActionButton.prototype.render = function () {
        var _this = this;
        var _a = this.props, result = _a.result, data = _a.data, schema = _a.schema, actionName = _a.actionName, onSuccess = _a.onSuccess, _b = _a.refetchQueries, refetchQueries = _b === void 0 ? this.refetchQueries : _b, onCompleted = _a.onCompleted, update = _a.update, ignoreResults = _a.ignoreResults, optimisticResponse = _a.optimisticResponse, awaitRefetchQueries = _a.awaitRefetchQueries, onError = _a.onError, context = _a.context, resultFields = _a.resultFields, innerRef = _a.innerRef, rest = __rest(_a, ["result", "data", "schema", "actionName", "onSuccess", "refetchQueries", "onCompleted", "update", "ignoreResults", "optimisticResponse", "awaitRefetchQueries", "onError", "context", "resultFields", "innerRef"]);
        var queryFromFields = '';
        if (mandarina_1.Schema.instances[this.schemaName]) {
            if (!resultFields)
                throw new Error('ActionForm: if the result is a Schema you need to enter resultFields');
            queryFromFields = (0, utils_1.buildQueryFromFields)(resultFields);
        }
        if (resultFields) {
            queryFromFields = (0, utils_1.buildQueryFromFields)(resultFields, false);
        }
        var dataString = '', dataString2 = '';
        if (schema) {
            dataString = "($data: ".concat((0, utils_2.capitalize)(schema.name), "Input!)");
            dataString2 = "(data: $data)";
        }
        var gqlString = "\n            mutation ".concat(actionName, " ").concat(dataString, "{\n                ").concat(actionName, " ").concat(dataString2, "\n                    ").concat(queryFromFields, "\n            }\n        ");
        var MUTATION = (0, graphql_tag_1.default)(gqlString);
        return (React.createElement(react_apollo_1.Mutation, { mutation: MUTATION, onCompleted: onCompleted, 
            // @ts-ignore
            refetchQueries: refetchQueries, update: update, ignoreResults: ignoreResults, optimisticResponse: optimisticResponse, awaitRefetchQueries: awaitRefetchQueries, onError: onError, context: context }, function (mutation, _a) {
            var loading = _a.loading, error = _a.error;
            return (React.createElement(button_1.default, __assign({ loading: loading }, rest, { ref: innerRef, onClick: function (e) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (rest.onClick)
                            rest.onClick(e);
                        mutation({ variables: { data: data } }).then(function (result) { return onSuccess && onSuccess(result); });
                        return [2 /*return*/];
                    });
                }); } })));
        }));
    };
    return ActionButton;
}(React.PureComponent));
var ActionFormWithApollo = (0, react_apollo_1.withApollo)(ActionButton);
exports.default = React.forwardRef(function (props, ref) {
    return React.createElement(ActionFormWithApollo, __assign({}, props, { innerRef: ref }));
});
//# sourceMappingURL=ActionButton.js.map