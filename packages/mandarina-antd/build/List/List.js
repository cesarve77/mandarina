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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
var table_1 = __importDefault(require("antd/lib/table"));
var mandarina_1 = require("mandarina");
var React = __importStar(require("react"));
var lodash_1 = require("lodash");
var ListVirtualized_1 = require("./ListVirtualized");
var Mutate_1 = require("mandarina/build/Operations/Mutate");
var antd_1 = require("antd");
//
// const components = {
//     header: {
//         cell: ListHeader
//     }
// };
var List = /** @class */ (function (_super) {
    __extends(List, _super);
    function List(props) {
        var _this = _super.call(this, props) || this;
        _this.hasNextPage = false;
        _this.refetching = false;
        _this.getColumnDefinition = function (field, index) {
            var parentPath = (0, ListVirtualized_1.getParentCellComponent)(field, _this.props.schema);
            if (parentPath) {
                field = parentPath;
            }
            var overwrite = _this.props.overwrite && _this.props.overwrite[field];
            var definition;
            if (!_this.props.schema.hasPath(field) && field.indexOf('.') < 0 && overwrite) {
                definition = (0, lodash_1.merge)({
                    list: {
                        noFilter: true,
                        noSort: true
                    }
                }, (0, Mutate_1.deepClone)(_this.props.schema.applyDefinitionsDefaults({ type: String }, field)), overwrite);
            }
            else {
                definition = _this.props.schema.getPathDefinition(field);
                if (overwrite) {
                    definition = (0, lodash_1.merge)((0, Mutate_1.deepClone)(definition), overwrite);
                }
            }
            if (!definition.list)
                throw new Error("You need to provide overwrite full definition for \"".concat(field, "\""));
            if (definition.list.hidden)
                return;
            return {
                // fixed: index===0 ? 'left' :undefined,
                dataIndex: field,
                key: field,
                width: definition.list.width,
                title: definition.label ? definition.label : "",
                render: function (value, row, index) {
                    var CellComponent = definition.list.CellComponent || ListVirtualized_1.DefaultCellComponent;
                    return React.createElement(CellComponent, __assign({ columnIndex: 0, rowIndex: index, data: _this.data, field: field }, definition.list.props));
                },
                onHeaderCell: function (column) { return ({
                    field: field,
                    fieldDefinition: definition,
                    // onFilterChange: this.onFilterChange,
                    width: column.width,
                    onResize: _this.handleResize(index),
                }); }
            };
        };
        _this.buildFetchMore = function (fetchMore, endCursor) {
            var name = _this.props.schema.names.query.connection;
            _this.fetchMore = function () {
                _this.refetching = true;
                fetchMore({
                    variables: {
                        after: endCursor
                    },
                    updateQuery: function (previousResult, _a) {
                        var _b;
                        var fetchMoreResult = _a.fetchMoreResult;
                        _this.refetching = false;
                        var newEdges = fetchMoreResult[name].edges;
                        var pageInfo = fetchMoreResult[name].pageInfo;
                        var aggregate = fetchMoreResult[name].aggregate;
                        return newEdges.length
                            ? (_b = {},
                                // Put the new comments at the end of the list and update `pageInfo`
                                // so we have the new `endCursor` and `hasNextPage` values
                                _b[name] = {
                                    __typename: previousResult[name].__typename,
                                    edges: __spreadArray(__spreadArray([], previousResult[name].edges, true), newEdges, true),
                                    pageInfo: pageInfo,
                                    aggregate: aggregate
                                },
                                _b) : previousResult;
                    }
                }).catch((console.error)); //todo
            };
        };
        _this.filters = {};
        // onFilterChange: OnFilterChange = (field, where) => {
        //     if (where && !isEmpty(where)) {
        //         this.filters[field] = where
        //     } else {
        //         delete this.filters[field]
        //     }
        //     const allFilters = Object.values(this.filters)
        //     this.variables.where = this.variables.where || {}
        //     if (this.props.where) {
        //         this.variables.where = {AND: [this.props.where, ...allFilters]}
        //     } else {
        //         this.variables.where = {AND: allFilters}
        //     }
        //
        //     this.refetch(this.variables)
        // }
        _this.handleResize = function (index) { return function (e, _a) {
            var size = _a.size;
            _this.setState(function (_a) {
                var columns = _a.columns;
                var nextColumns = __spreadArray([], columns, true);
                nextColumns[index] = __assign(__assign({}, nextColumns[index]), { width: size.width });
                "";
                return { columns: nextColumns };
            });
        }; };
        _this.firstLoad = true;
        //const definitions: Partial<FieldDefinitions> = {}
        var fields = _this.props.fields;
        var columns = _this.getColumns(fields);
        _this.state = { columns: columns };
        _this.me = React.createRef();
        _this.loading = true;
        _this.data = [];
        return _this;
        //this.definitions=definitions
    }
    List.prototype.getColumns = function (fields, path) {
        var _this = this;
        if (path === void 0) { path = ""; }
        var columns = [];
        fields.forEach(function (field, index) {
            var column = _this.getColumnDefinition(field, index);
            if (column && !columns.some(function (c) { return !!(c && c.dataIndex === column.dataIndex); })) {
                columns.push(column);
            }
        });
        return columns;
    };
    List.prototype.render = function () {
        var _this = this;
        var _a = this.props, schema = _a.schema, first = _a.first, fields = _a.fields, header = _a.header, where = _a.where, Dimmer = _a.Dimmer, tableProps = _a.tableProps, findBaseProps = __rest(_a, ["schema", "first", "fields", "header", "where", "Dimmer", "tableProps"]);
        var columns = this.state.columns;
        return (React.createElement("div", { className: "list-wrapper", style: { width: '100%' }, ref: this.me },
            React.createElement(mandarina_1.Find, __assign({ schema: schema, where: where, first: first, fields: fields }, findBaseProps), function (_a) {
                var _b = _a.data, data = _b === void 0 ? [] : _b, variables = _a.variables, refetch = _a.refetch, loading = _a.loading, count = _a.count, pageInfo = _a.pageInfo, fetchMore = _a.fetchMore, error = _a.error;
                _this.loading = loading;
                if (error)
                    return React.createElement(antd_1.Result, { status: "500", subTitle: error.message });
                _this.refetch = refetch;
                _this.variables = variables;
                _this.buildFetchMore(fetchMore, pageInfo && pageInfo.endCursor);
                _this.hasNextPage = !!(pageInfo && pageInfo.hasNextPage);
                var dataSource = loading && _this.hasNextPage ? __spreadArray(__spreadArray([], data, true), new Array(first).fill({}), true) : data;
                if (!loading)
                    _this.firstLoad = false;
                //this.lastHeight = this.me && this.me.current && this.me.current.offsetHeight || 0// && this.me.current && this.me.current.clientHeight || document.body.clientHeight + scrollTop + 200
                var headerNode = null;
                if (typeof header === 'function') {
                    var Header = header;
                    headerNode = React.createElement(Header, { data: dataSource, count: count });
                }
                if (typeof header === 'object' || !header) {
                    // @ts-ignore
                    headerNode = React.createElement(HeaderDefault, __assign({ data: dataSource, count: count }, header));
                }
                _this.data = dataSource;
                return (React.createElement("div", null,
                    headerNode,
                    React.createElement("div", { style: { position: 'relative' } },
                        Dimmer && React.createElement(Dimmer, null),
                        React.createElement(table_1.default, __assign({ scroll: { x: 'auto' }, pagination: {
                                pageSize: 5000,
                                total: count,
                                simple: true,
                                hideOnSinglePage: true,
                            }, rowKey: function (record) { return record.id; }, bordered: true, 
                            //components={components}
                            columns: columns, loading: _this.firstLoad, dataSource: dataSource }, tableProps)))));
            })));
    };
    List.defaultProps = {
        first: 300,
        pageSize: 300,
    };
    return List;
}(React.Component));
exports.List = List;
var HeaderDefault = function (_a) {
    var count = _a.count, _b = _a.title, title = _b === void 0 ? ' total' : _b;
    return React.createElement("div", { style: { textAlign: "right" } },
        count,
        " ",
        title);
};
//# sourceMappingURL=List.js.map