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
var react_apollo_1 = require("react-apollo");
var graphql_tag_1 = __importDefault(require("graphql-tag"));
var mandarina_1 = require("mandarina");
var index_1 = require("./index");
var AutoForm_1 = __importDefault(require("uniforms-antd/AutoForm"));
var Bridge_1 = require("./Bridge");
var utils_1 = require("mandarina/build/Schema/utils");
var utils_2 = require("mandarina/build/Operations/utils");
var SubmitField_1 = __importDefault(require("uniforms-antd/SubmitField"));
var Mutate_1 = require("mandarina/build/Operations/Mutate");
var ActionForm = /** @class */ (function (_super) {
    __extends(ActionForm, _super);
    function ActionForm() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { changed: false };
        _this.refetchQueries = function (mutationResult) {
            return Mutate_1.refetchQueries(mutationResult, _this.props.client, _this.props.refetchSchemas, _this.props.schema);
        };
        return _this;
    }
    ActionForm.prototype.render = function () {
        var _this = this;
        var _a = this.props, result = _a.result, actionName = _a.actionName, schema = _a.schema, children = _a.children, onChange = _a.onChange, _b = _a.refetchQueries, refetchQueries = _b === void 0 ? this.refetchQueries : _b, onCompleted = _a.onCompleted, fields = _a.fields, onSubmit = _a.onSubmit, update = _a.update, ignoreResults = _a.ignoreResults, optimisticResponse = _a.optimisticResponse, awaitRefetchQueries = _a.awaitRefetchQueries, onSubmitSuccess = _a.onSubmitSuccess, onSubmitFailure = _a.onSubmitFailure, onError = _a.onError, context = _a.context, overwrite = _a.overwrite, resultFields = _a.resultFields, innerRef = _a.innerRef, rest = __rest(_a, ["result", "actionName", "schema", "children", "onChange", "refetchQueries", "onCompleted", "fields", "onSubmit", "update", "ignoreResults", "optimisticResponse", "awaitRefetchQueries", "onSubmitSuccess", "onSubmitFailure", "onError", "context", "overwrite", "resultFields", "innerRef"]);
        var changed = this.state.changed;
        var queryFromFields = '';
        var schemaName = result.replace(/[\[\]\!]/g, '');
        if (mandarina_1.Schema.instances[schemaName]) {
            if (!resultFields)
                throw new Error('ActionForm: if the result is a Schema you need to enter resultFields');
            queryFromFields = utils_2.buildQueryFromFields(resultFields);
        }
        if (resultFields) {
            queryFromFields = utils_2.buildQueryFromFields(resultFields, false);
        }
        var gqlString = "\n            mutation " + actionName + "($data: " + utils_1.capitalize(schema.name) + "Input!) {\n                " + actionName + "(data: $data)\n                    " + queryFromFields + "\n            }\n        ";
        var bridge = new Bridge_1.Bridge(schema, fields, overwrite);
        var MUTATION = graphql_tag_1.default(gqlString);
        return (react_1.default.createElement(react_apollo_1.Mutation, { mutation: MUTATION, onCompleted: onCompleted, refetchQueries: refetchQueries, update: update, ignoreResults: ignoreResults, optimisticResponse: optimisticResponse, awaitRefetchQueries: awaitRefetchQueries, onError: onError, context: context }, function (mutation, _a) {
            var loading = _a.loading, error = _a.error, restMutation = __rest(_a, ["loading", "error"]);
            return (react_1.default.createElement(AutoForm_1.default, __assign({ disabled: loading, onSubmit: function (data) {
                    onSubmit && onSubmit(data);
                    _this.setState({ changed: false });
                    return mutation({ variables: { data: data } });
                }, fields: fields, onSubmitSuccess: onSubmitSuccess, onSubmitFailure: onSubmitFailure, schema: bridge, onChange: function (key, value) {
                    if (error)
                        _this.setState({ changed: true });
                    onChange && onChange(key, value);
                }, error: changed ? undefined : error, ref: innerRef }, rest),
                children && Array.isArray(children) && children,
                children && !Array.isArray(children) && (typeof children !== "function") && children,
                children && !Array.isArray(children) && (typeof children === "function") && children({ loading: loading }),
                !children && (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(index_1.AutoFields, { autoField: index_1.AutoField, fields: fields }),
                    react_1.default.createElement(index_1.ErrorsField, { style: { marginBottom: '15px' } }),
                    react_1.default.createElement(SubmitField_1.default, { size: 'large', loading: loading })))));
        }));
    };
    return ActionForm;
}(react_1.PureComponent));
var ActionFormWithApollo = react_apollo_1.withApollo(ActionForm);
exports.default = react_1.default.forwardRef(function (props, ref) {
    return react_1.default.createElement(ActionFormWithApollo, __assign({}, props, { innerRef: ref }));
});
//# sourceMappingURL=ActionForm.js.map