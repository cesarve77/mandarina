"use strict";
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
var React = __importStar(require("react"));
var react_1 = require("react");
var AutoForm_1 = __importDefault(require("uniforms-antd/AutoForm"));
var mandarina_1 = require("mandarina");
var Bridge_1 = require("../Bridge");
var ListFilters_1 = require("./ListFilters");
var Mutate_1 = require("mandarina/build/Operations/Mutate");
var HiddenField_1 = __importDefault(require("uniforms-antd/HiddenField"));
var lodash_1 = require("lodash");
exports.uuid = function () { return 'i' + (Date.now() - 1540000000000 + Math.random()).toString(36); };
exports.ListFilter = react_1.memo(function (_a) {
    var onFilterChange = _a.onFilterChange, overwrite = _a.overwrite, field = _a.field, filter = _a.filter, schema = _a.schema, filters = _a.filters;
    var FieldComponent = react_1.useMemo(function () {
        var fieldDefinition = lodash_1.merge(Mutate_1.deepClone(schema.getPathDefinition(field)), overwrite);
        var FC;
        if (fieldDefinition.isTable) {
            if (fieldDefinition.list.filterComponent === undefined) {
                throw new Error("Field: \"" + field + "\" you need to set \"list.noFilter\" to true, or pass your custom filterComponent  \"");
            }
            else {
                FC = fieldDefinition.list.filterComponent;
            }
        }
        else {
            FC = fieldDefinition.list.filterComponent === undefined ? ListFilters_1.getDefaultComponent(fieldDefinition) : fieldDefinition.list.filterComponent;
        }
        return FC;
    }, [schema, field]);
    var name = react_1.useRef("filter-" + field + "-" + exports.uuid()).current; //todo remove this dependeincy making schema get optional name
    var bridge = react_1.useMemo(function () {
        var fieldDefinition = Mutate_1.deepClone(schema.getPathDefinition(field));
        fieldDefinition.validators = fieldDefinition.validators.filter(function (_a) {
            var validatorName = _a.validatorName, arrayValidator = _a.arrayValidator, tableValidator = _a.tableValidator;
            return validatorName !== 'required' && !arrayValidator && !tableValidator;
        });
        var filterSchema = new mandarina_1.Schema({
            // @ts-ignore
            filter: fieldDefinition,
            internal: { type: String }
        }, {
            name: name
        });
        return new Bridge_1.Bridge(filterSchema, filterSchema.getFields());
    }, [schema, field]);
    var onSubmit = function (_a) {
        var filter = _a.filter;
        if (filter)
            filter.internal = 'true'; //this is for avoid rerender, if the filter does not have internal, is because is a external change as clear filters.
        onFilterChange(field, filter);
    };
    return FieldComponent && (React.createElement(AutoForm_1.default, { schema: bridge, autosave: true, autosaveDelay: 400, style: { width: 'calc(100% - 4px)' }, onSubmit: onSubmit, onValidate: function (model, error, callback) {
            return callback(null);
        }, model: { filter: filter } },
        React.createElement(HiddenField_1.default, { name: 'internal' }),
        React.createElement(FieldComponent, { name: 'filter', label: false, col: false, defaultValue: '', filters: filters })));
});
exports.default = exports.ListFilter;
//# sourceMappingURL=ListFilter.js.map