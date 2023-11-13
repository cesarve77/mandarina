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
exports.DeleteForm = exports.UpdateForm = exports.CreateForm = void 0;
var react_1 = __importStar(require("react"));
var mandarina_1 = require("mandarina");
var AutoForm_1 = __importDefault(require("uniforms-antd/AutoForm"));
var SubmitField_1 = __importDefault(require("uniforms-antd/SubmitField"));
var Mutate_1 = require("mandarina/build/Operations/Mutate");
var Bridge_1 = require("./Bridge");
//
var ErrorsField = require("./uniforms/ErrorsField").default;
var AutoFields = require("./uniforms/AutoFields").default;
var AutoField = require("./uniforms/AutoField").default;
exports.CreateForm = react_1.default.forwardRef(function (props, ref) {
    return react_1.default.createElement(Form, __assign({ Component: mandarina_1.Create }, props, { innerRef: ref }));
});
exports.UpdateForm = react_1.default.forwardRef(function (_a, ref) {
    var fields = _a.fields, _b = _a.readFields, readFields = _b === void 0 ? fields : _b, props = __rest(_a, ["fields", "readFields"]);
    var Component = (0, react_1.useMemo)(function () { return function (_a) {
        var children = _a.children, id = _a.id, props = __rest(_a, ["children", "id"]);
        return react_1.default.createElement(mandarina_1.Update, __assign({}, props, { fields: readFields, id: id, children: children }));
    }; }, [readFields.join()]);
    return react_1.default.createElement(Form, __assign({ Component: Component, fields: fields }, props, { innerRef: ref }));
});
exports.DeleteForm = react_1.default.forwardRef(function (props, ref) {
    return react_1.default.createElement(Form, __assign({ Component: Mutate_1.Delete }, props, { innerRef: ref }));
});
// /**
//  * If a fields is Table and the form is query, it'll remove all subfields diferents to id
//  * @param fields
//  * @param schema
//  * @param overwrite
//  */
// export const normalizeFields = (fields: string[], schema: Schema, overwrite?: Overwrite) => {
//     const tables: string[] = []
//     const result: string[] = []
//     fields.forEach((field) => {
//         if (field.match(/\.id$/)) {
//             const parent = field.substr(0, field.length - 3)
//             const def = schema.getPathDefinition(parent)
//             // @ts-ignore
//             const query = (overwrite && overwrite[field] && overwrite[field].form && overwrite[field].form.props && overwrite[field].form.props.query) || (def && def.form && def.form.props && def.form.props.query)
//             if (query) tables.push(parent.replace(/\./, '\\.'))
//         }
//         result.push(field)
//     })
//     if (tables.length === 0) return result
//     const rg = new RegExp(`^(${tables.join('|')})\\.(?!id$).*`)
//     return result.filter((field) => !rg.test(field))
// }
var Form = function (_a) {
    var Component = _a.Component, fields = _a.fields, schema = _a.schema, innerRef = _a.innerRef, id = _a.id, onSubmit = _a.onSubmit, children = _a.children, showInlineError = _a.showInlineError, autosaveDelay = _a.autosaveDelay, autosave = _a.autosave, model = _a.model, disabled = _a.disabled, onChange = _a.onChange, error = _a.error, modelTransform = _a.modelTransform, label = _a.label, onSubmitSuccess = _a.onSubmitSuccess, onValidate = _a.onValidate, onSubmitFailure = _a.onSubmitFailure, onChangeModel = _a.onChangeModel, overwrite = _a.overwrite, style = _a.style, validate = _a.validate, mutationProps = __rest(_a, ["Component", "fields", "schema", "innerRef", "id", "onSubmit", "children", "showInlineError", "autosaveDelay", "autosave", "model", "disabled", "onChange", "error", "modelTransform", "label", "onSubmitSuccess", "onValidate", "onSubmitFailure", "onChangeModel", "overwrite", "style", "validate"]);
    var bridge = new Bridge_1.Bridge(schema, fields, overwrite);
    var isDelete = Component === Mutate_1.Delete;
    var allFields = isDelete ? [] : fields;
    return (react_1.default.createElement(Component, __assign({ id: id, schema: schema, fields: allFields }, mutationProps), function (_a) {
        var mutate = _a.mutate, _b = _a.doc, doc = _b === void 0 ? model : _b, loading = _a.loading, called = _a.called, rest = __rest(_a, ["mutate", "doc", "loading", "called"]);
        return (react_1.default.createElement(AutoForm_1.default, { key: id && doc && 'key', schema: bridge, model: doc, onSubmit: function (model) {
                schema.clean(model, allFields); // fill null all missing keys
                onSubmit && onSubmit(model);
                return mutate(model);
            }, onChangeModel: onChangeModel, ref: innerRef, onChange: onChange, modelTransform: modelTransform, autosave: autosave, label: label, error: error, disabled: loading || disabled, showInlineError: showInlineError, autosaveDelay: autosaveDelay, autoField: AutoField, onSubmitSuccess: onSubmitSuccess, onSubmitFailure: onSubmitFailure, onValidate: onValidate, style: style, validate: validate },
            children && typeof children !== "function" && children,
            children && typeof children === "function" && children(__assign(__assign({ doc: doc, loading: loading, called: called }, rest), { fields: fields })),
            !children && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(AutoFields, { autoField: AutoField, fields: fields }),
                react_1.default.createElement(ErrorsField, { style: { marginBottom: '15px' } }),
                !autosave && react_1.default.createElement(SubmitField_1.default, { value: 'Save', size: 'large', loading: loading })))));
    }));
};
//# sourceMappingURL=Forms.js.map