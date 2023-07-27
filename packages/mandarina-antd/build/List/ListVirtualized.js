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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mandarina_1 = require("mandarina");
var react_1 = __importDefault(require("react"));
var memoize_one_1 = __importDefault(require("memoize-one"));
// import {isEqual} from 'lodash';
var lodash_1 = require("lodash");
var react_window_1 = require("react-window");
var empty_1 = __importDefault(require("antd/lib/empty"));
var ListFilters_1 = require("./ListFilters");
var utils_1 = require("mandarina/build/Schema/utils");
var HeaderDefault_1 = __importDefault(require("./HeaderDefault"));
var SortableColumns_1 = require("./SortableColumns");
var array_move_1 = __importDefault(require("array-move"));
var Mutate_1 = require("mandarina/build/Operations/Mutate");
var utils_2 = require("./utils");
var antd_1 = require("antd");
var estimatedColumnWidthDefault = 175;
var estimatedRowHeightDefault = 60;
var createItemData = memoize_one_1.default(function (data, columns, refetch, query, variables, onClick, onMouseEnter, onMouseLeave) { return ({
    data: data, columns: columns, refetch: refetch, query: query, variables: variables, onClick: onClick, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave
}); });
var ListVirtualized = /** @class */ (function (_super) {
    __extends(ListVirtualized, _super);
    function ListVirtualized(props) {
        var _this = _super.call(this, props) || this;
        _this.gridRef = react_1.default.createRef();
        _this.data = [];
        _this.hasNextPage = false;
        _this.overscanRowStartIndex = 0;
        _this.overscanRowStopIndex = 0;
        _this.visibleRowStartIndex = 0;
        _this.visibleRowStopIndex = 0;
        _this.resize = function () {
            var container = _this.container.current && _this.container.current.parentNode && _this.container.current.parentNode.parentElement;
            var deep = 0;
            while (container && container.clientHeight === 0 && deep < 100) {
                container = container.parentElement;
                deep++;
            }
            if (container) {
                if (!_this.props.height && _this.state.height !== container.clientHeight) {
                    _this.setState({ height: container.clientHeight });
                }
                if (!_this.props.width && _this.state.width !== container.clientWidth) {
                    _this.setState({ width: container.clientWidth });
                }
            }
        };
        _this.onResize = function () {
            _this.onResizeTimeoutId && window.clearTimeout(_this.onResizeTimeoutId);
            _this.onResizeTimeoutId = window.setTimeout(_this.resize, 200);
        };
        /**
         * used as method for ref , ref.current.fresh()
         * do not remove
         * @param full
         */
        _this.refresh = function (full) {
            if (full === void 0) { full = true; }
            if (full)
                _this.data = [];
            return _this.onScroll({});
        };
        _this.onScroll = function (_a) {
            var scrollLeft = _a.scrollLeft;
            return new Promise(function (resolve, reject) {
                if (_this.tHead.current) {
                    _this.tHead.current.scrollLeft = scrollLeft;
                }
                //this.setState({row: this.visibleRowStartIndex})
                _this.onScrollTimeoutId && window.clearTimeout(_this.onScrollTimeoutId);
                _this.onScrollTimeoutId = window.setTimeout(function () {
                    //If all visible are loaded, then not refetch
                    if (_this.data.length && __spreadArrays(_this.data).slice(_this.visibleRowStartIndex, _this.visibleRowStopIndex).every(function (val) { return val !== undefined; })) {
                        resolve(false);
                        return;
                    }
                    //estan todos en el mismo ciclo
                    var skip = _this.overscanRowStartIndex - (_this.overscanRowStartIndex % _this.firstLoad);
                    _this.props.pollInterval && _this.stopPolling && _this.stopPolling();
                    if (!_this.data[_this.overscanRowStartIndex] && !_this.data[_this.overscanRowStopIndex]) {
                        _this.refetch({
                            skip: skip,
                            first: _this.overscanRowStopIndex <= _this.firstLoad ? _this.firstLoad : 2 * _this.firstLoad
                        })
                            .then(resolve)
                            .catch(reject);
                    }
                    else if (!_this.data[_this.overscanRowStartIndex]) {
                        _this.refetch({ skip: skip, first: _this.firstLoad })
                            .then(resolve)
                            .catch(reject);
                    }
                    else if (!_this.data[_this.overscanRowStopIndex]) {
                        _this.refetch({ skip: skip + _this.firstLoad, first: _this.firstLoad })
                            .then(resolve)
                            .catch(reject);
                    }
                    _this.props.pollInterval && _this.startPolling && _this.startPolling(_this.props.pollInterval);
                }, 100);
            });
        };
        _this.getColumnDefinition = function (field) {
            //detect if parent has a CellComponent
            var parentPath = exports.getParentCellComponent(field, _this.props.schema);
            if (parentPath) {
                field = parentPath;
            }
            var overwrite = _this.state.overwrite && _this.state.overwrite[field];
            var definition;
            if (!_this.props.schema.hasPath(field) && field.indexOf('.') < 0 && overwrite) {
                definition = lodash_1.merge({
                    list: {
                        noFilter: true,
                        noSort: true
                    }
                }, Mutate_1.deepClone(_this.props.schema.applyDefinitionsDefaults({ type: String }, field)), overwrite);
            }
            else {
                definition = _this.props.schema.getPathDefinition(field);
                if (overwrite) {
                    definition = lodash_1.merge(Mutate_1.deepClone(definition), overwrite);
                }
            }
            if (!definition.list)
                throw new Error("You need to provide overwrite full definition for \"" + field + "\"");
            if (definition.list.hidden) {
                return null;
            }
            else {
                return {
                    field: field,
                    loadingElement: definition.list.loadingElement,
                    CellComponent: definition.list.CellComponent,
                    FilterComponent: definition.list.filterComponent || ListFilters_1.getDefaultFilterMethod(field, _this.props.schema),
                    filterMethod: definition.list.filterMethod || ListFilters_1.getDefaultFilterMethod(field, _this.props.schema),
                    title: definition.label ? definition.label : "",
                    width: definition.list.width || estimatedColumnWidthDefault,
                    filter: !definition.list.noFilter,
                    noSort: !!(definition.isTable || definition.isArray || field.indexOf('.') > 0 || definition.list.noSort),
                    props: definition.list.props || {},
                };
            }
        };
        _this.onFilterChange = function (field, filter) {
            _this.data = [];
            // @ts-ignore
            _this.gridRef.current && _this.gridRef.current.scrollToItem({
                rowIndex: 0
            });
            _this.setState(function (_a) {
                var filters = _a.filters;
                var newFilters = __assign({}, filters);
                if (filter && !lodash_1.isEmpty(filter)) {
                    newFilters[field] = filter;
                }
                else {
                    delete newFilters[field];
                }
                if (_this.props.onFilterChange) {
                    _this.props.onFilterChange(newFilters);
                    return null;
                }
                else {
                    return { filters: newFilters };
                }
            });
        };
        _this.onHideOrShowColumn = function (field, index, show) {
            // @ts-ignore
            _this.gridRef.current && _this.gridRef.current.resetAfterColumnIndex(index, false);
            _this.setState(function (_a) {
                var overwrite = _a.overwrite;
                var newOverwrite = Mutate_1.deepClone(overwrite) || {};
                lodash_1.set(newOverwrite, [field, 'list', 'hidden'], !show);
                if (_this.props.onOverwriteChange) {
                    _this.props.onOverwriteChange(newOverwrite);
                    return null;
                }
                else {
                    return { overwrite: newOverwrite };
                }
            });
        };
        _this.onHideColumn = function (field, index) {
            var _a = _this.state, fields = _a.fields, overwrite = _a.overwrite;
            //check if is the last column, if is the the last you con not hidden
            var showingColumns = _this.calcColumns(fields, overwrite).reduce(function (mem, col) { return mem + (!!col ? 1 : 0); }, 0);
            if (showingColumns === 1)
                return;
            _this.onHideOrShowColumn(field, index, false);
        };
        _this.onShowColumn = function (field, index) {
            _this.onHideOrShowColumn(field, index, true);
        };
        _this.onResizeStop = function (field, width, index) {
            // @ts-ignore
            _this.gridRef.current && _this.gridRef.current.resetAfterColumnIndex(index, false);
            _this.setState(function (_a) {
                var overwrite = _a.overwrite;
                var newOverwrite = Mutate_1.deepClone(overwrite) || {};
                lodash_1.set(newOverwrite, [field, 'list', 'width'], width);
                if (_this.props.onOverwriteChange) {
                    _this.props.onOverwriteChange(newOverwrite);
                    return null;
                }
                else {
                    return { overwrite: newOverwrite };
                }
            });
        };
        _this.onColumnOrderChange = function (_a) {
            var oldIndex = _a.oldIndex, newIndex = _a.newIndex;
            // @ts-ignore
            _this.gridRef.current && _this.gridRef.current.resetAfterColumnIndex(oldIndex, false);
            // @ts-ignore
            _this.gridRef.current && _this.gridRef.current.resetAfterColumnIndex(newIndex, false);
            _this.setState(function (_a) {
                var fields = _a.fields;
                var field = fields[oldIndex];
                var parent = exports.getParentCellComponent(field, _this.props.schema);
                var newFields;
                if (parent) {
                    //if field has a parent cell component I just put all siblings at the end to no affect the order
                    //
                    newFields = array_move_1.default(fields, oldIndex, newIndex);
                    var siblings = newFields.filter(function (newField) { return newField !== field && newField.match(new RegExp("^" + parent + ".")); });
                    newFields = newFields.filter(function (newField) { return !(newField !== field && newField.match(new RegExp("^" + parent + "."))); });
                    newFields = newFields.concat(siblings);
                }
                else {
                    newFields = array_move_1.default(fields, oldIndex, newIndex);
                }
                if (_this.props.onFieldsChange) {
                    _this.props.onFieldsChange(newFields);
                    return null;
                }
                else {
                    return ({ fields: newFields });
                }
            });
        };
        _this.onSortChange = function (field, direction) {
            var _a;
            var sort = (_a = {}, _a[field] = direction, _a);
            if (_this.props.onSortChange) {
                _this.props.onSortChange(sort);
            }
            else {
                _this.setState({ sort: sort });
            }
        };
        _this.getAllFilters = memoize_one_1.default(function (filters, overwrite) {
            var allFilters = [];
            for (var field in filters) {
                var fieldDefinition = _this.getColumnDefinition(field);
                if (!fieldDefinition)
                    continue;
                var filterMethod = fieldDefinition.filterMethod;
                var filter = filters[field];
                allFilters.push(filterMethod(filter));
            }
            return allFilters;
        }, utils_2.equalityFn);
        _this.calcColumns = memoize_one_1.default(function (fields, overwrite) {
            var columns = [];
            fields.forEach(function (field) {
                var column = _this.getColumnDefinition(field);
                if (column && !columns.some(function (c) { return !!(c && c.field === column.field); })) {
                    columns.push(column);
                }
                else {
                    columns.push(null);
                }
            });
            return columns;
        }, utils_2.equalityFn);
        var _a = props.fields, fields = _a === void 0 ? props.schema.getFields() : _a, _b = props.filters, filters = _b === void 0 ? {} : _b, overwrite = props.overwrite, sort = props.sort;
        //const definitions: Partial<FieldDefinitions> = {}
        _this.state = { fields: fields, overwrite: overwrite, height: _this.props.height || 0, width: _this.props.width || 0, filters: filters, sort: sort };
        _this.tHead = react_1.default.createRef();
        _this.container = react_1.default.createRef();
        // this.firstLoad = Math.max(this.props.first || 0, canUseDOM ? Math.ceil((this.props.height || window.innerHeight) / estimatedRowHeight) : 0)
        _this.firstLoad = _this.props.first || 50;
        _this.overscanRowStopIndex = _this.firstLoad;
        return _this;
    }
    ListVirtualized.prototype.getSnapshotBeforeUpdate = function (prevProps, prevState) {
        if (this.props.onFieldsChange && (this.props.onOverwriteChange)) {
            if (!lodash_1.isEqual(this.state.overwrite, prevState.overwrite)) {
                // @ts-ignore
                this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(0, false);
                return null;
            }
            for (var i = 0; i < prevState.fields.length; i++) {
                if (prevState.fields[i] !== this.state.fields[i]) {
                    // @ts-ignore
                    this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(i, false);
                    return null;
                }
            }
        }
        return null;
    };
    ListVirtualized.getDerivedStateFromProps = function (props, state) {
        var result = {};
        if (props.onFieldsChange && !lodash_1.isEqual(props.fields, state.fields)) {
            result.fields = props.fields || props.schema.getFields();
        }
        if ((props.onOverwriteChange) && !lodash_1.isEqual(props.overwrite, state.overwrite)) {
            result.overwrite = __assign({}, props.overwrite);
        }
        if (props.onSortChange && !lodash_1.isEqual(props.sort, state.sort)) {
            result.sort = props.sort;
        }
        if (props.onFilterChange && !lodash_1.isEqual(props.filters, state.filters)) {
            result.filters = props.filters || {};
        }
        return result;
    };
    ListVirtualized.prototype.componentDidMount = function () {
        var _a = this.props, height = _a.height, width = _a.width;
        if (height && width)
            return;
        this.resize();
        window.addEventListener('resize', this.onResize);
    };
    ListVirtualized.prototype.componentWillUnmount = function () {
        window.removeEventListener('resize', this.onResize);
    };
    ListVirtualized.prototype.render = function () {
        var _this = this;
        var _a = this.props, onDataChange = _a.onDataChange, schema = _a.schema, leftButtons = _a.leftButtons, where = _a.where, estimatedRowHeight = _a.estimatedRowHeight, rowHeight = _a.rowHeight, _b = _a.overscanRowCount, overscanRowCount = _b === void 0 ? 2 : _b, _c = _a.overLoad, overLoad = _c === void 0 ? 1 : _c, header = _a.header, onClick = _a.onClick, onMouseEnter = _a.onMouseEnter, onMouseLeave = _a.onMouseLeave, rest = __rest(_a, ["onDataChange", "schema", "leftButtons", "where", "estimatedRowHeight", "rowHeight", "overscanRowCount", "overLoad", "header", "onClick", "onMouseEnter", "onMouseLeave"]); //todo rest props
        var _d = this.state, fields = _d.fields, width = _d.width, height = _d.height, filters = _d.filters, sort = _d.sort, overwrite = _d.overwrite;
        var columns = this.calcColumns(fields, overwrite);
        var getColumnWidth = function (index) {
            if (!columns[index])
                return 0;
            // @ts-ignore
            return columns[index].width;
        };
        this.estimatedColumnWidth = columns.reduce(function (mem, c) { return c ? c.width + mem : mem; }, 0) / columns.length;
        var allFilters = this.getAllFilters(filters, overwrite);
        var whereAndFilter;
        if (where && !lodash_1.isEmpty(where) && allFilters.length > 0) {
            whereAndFilter = { AND: __spreadArrays([where], allFilters) };
        }
        else if (where && !lodash_1.isEmpty(where)) {
            whereAndFilter = where;
        }
        else if (allFilters.length > 0) {
            whereAndFilter = { AND: allFilters };
        }
        return (react_1.default.createElement(mandarina_1.Find, __assign({ schema: schema, where: whereAndFilter, skip: 0, first: this.firstLoad, sort: sort, 
            // @ts-ignore
            fields: fields, notifyOnNetworkStatusChange: true }, rest), function (_a) {
            var _b;
            var _c = _a.data, data = _c === void 0 ? [] : _c, query = _a.query, variables = _a.variables, error = _a.error, refetch = _a.refetch, loading = _a.loading, count = _a.count, client = _a.client, startPolling = _a.startPolling, stopPolling = _a.stopPolling, networkStatus = _a.networkStatus;
            var dataCollection = data;
            if (_this.data.length === 0 && data.length > 0 && !loading) {
                _this.data = Array(count).fill(undefined);
            }
            if (!loading && count > _this.data.length) { //when your are polling or refetching and the count change
                _this.data = __spreadArrays(_this.data, Array(count - _this.data.length).fill(undefined));
            }
            if (dataCollection.length && !loading) {
                // @ts-ignore
                //this.gridRef.current &&  this.gridRef.current.resetAfterRowIndex(variables.skip)
                (_b = _this.data).splice.apply(_b, __spreadArrays([variables.skip, dataCollection.length], dataCollection));
            }
            !loading && onDataChange && onDataChange(_this.data);
            _this.refetch = refetch;
            _this.startPolling = startPolling;
            _this.stopPolling = stopPolling;
            _this.variables = variables;
            var tHeadHeight = _this.tHead.current && _this.tHead.current.offsetHeight || 95;
            var itemData = createItemData(__spreadArrays(_this.data), columns, refetch, query, variables, onClick, onMouseEnter, onMouseLeave);
            var headerNode = null;
            if (typeof header === 'function') {
                var Header = header;
                headerNode =
                    react_1.default.createElement(Header, __assign({ count: count, client: client }, itemData, { fields: fields, sort: sort, filters: filters, overwrite: overwrite, onFieldsChange: _this.props.onFieldsChange, onSortChange: _this.props.onSortChange, onOverwriteChange: _this.props.onOverwriteChange, onFilterChange: _this.props.onFilterChange, loading: loading, schema: schema, leftButtons: leftButtons, where: whereAndFilter }));
            }
            if (typeof header === 'object' || !header) {
                headerNode =
                    react_1.default.createElement(HeaderDefault_1.default, __assign({ count: count, client: client }, itemData, { fields: fields, sort: sort, filters: filters, overwrite: overwrite, onFieldsChange: _this.props.onFieldsChange, onSortChange: _this.props.onSortChange, onOverwriteChange: _this.props.onOverwriteChange, onFilterChange: _this.props.onFilterChange, loading: loading, schema: schema, where: whereAndFilter, leftButtons: leftButtons }, header));
            }
            return (react_1.default.createElement(react_1.default.Fragment, null,
                headerNode,
                react_1.default.createElement("div", { className: 'mandarina-list', ref: _this.container, style: {
                        width: width,
                        height: height + tHeadHeight
                    } },
                    react_1.default.createElement("div", { ref: _this.tHead, className: 'mandarina-list-thead', style: { width: width, height: tHeadHeight ? tHeadHeight : 'auto' } },
                        react_1.default.createElement(SortableColumns_1.SortableColumns, { useWindowAsScrollContainer: true, tHead: _this.tHead, grid: _this.gridRef, empty: !error && !loading && !count, shouldCancelStart: function (event) {
                                // @ts-ignore
                                return event.target && event.target.classList && event.target.classList.contains('react-resizable-handle') || event.target.classList.contains('no-draggable') || ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName);
                            }, axis: 'x', lockAxis: 'x', pressThreshold: 10, distance: 10, onSortEnd: _this.onColumnOrderChange, width: _this.estimatedColumnWidth * columns.length, height: tHeadHeight }, columns.map(function (column, index) {
                            return column ?
                                react_1.default.createElement(SortableColumns_1.SortableColumn, { height: tHeadHeight, key: "item-" + column.field, index: index, columnIndex: index, column: column, sort: sort, overwrite: overwrite === null || overwrite === void 0 ? void 0 : overwrite[column.field], filters: filters, schema: schema, onResizeStop: _this.onResizeStop, onSortChange: _this.onSortChange, onFilterChange: _this.onFilterChange, onHideColumn: _this.onHideColumn }) : react_1.default.createElement("span", { key: index });
                        }))),
                    error && react_1.default.createElement(antd_1.Result, { status: "500", subTitle: error.message }),
                    !error && !loading && !count && react_1.default.createElement(empty_1.default, { style: { margin: '40px' } }),
                    height !== 0 &&
                        react_1.default.createElement(react_window_1.VariableSizeGrid, { ref: _this.gridRef, onScroll: _this.onScroll, height: height, rowCount: count || 0, estimatedColumnWidth: _this.estimatedColumnWidth, estimatedRowHeight: estimatedRowHeight, columnCount: columns.length, columnWidth: getColumnWidth, rowHeight: function (index) {
                                if (rowHeight) {
                                    return rowHeight(index, _this.data);
                                }
                                else {
                                    return estimatedRowHeight || estimatedRowHeightDefault;
                                }
                            }, width: width, itemData: itemData, overscanRowCount: overscanRowCount, onItemsRendered: function (_a) {
                                var overscanRowStartIndex = _a.overscanRowStartIndex, overscanRowStopIndex = _a.overscanRowStopIndex, visibleRowStartIndex = _a.visibleRowStartIndex, visibleRowStopIndex = _a.visibleRowStopIndex;
                                _this.overscanRowStartIndex = overscanRowStartIndex;
                                _this.overscanRowStopIndex = overscanRowStopIndex;
                                _this.visibleRowStartIndex = visibleRowStartIndex;
                                _this.visibleRowStopIndex = visibleRowStopIndex;
                            } }, Cell))));
        }));
    };
    ListVirtualized.defaultProps = {
        Header: HeaderDefault_1.default,
        height: 0,
        width: 0,
        estimatedRowHeight: estimatedRowHeightDefault,
    };
    return ListVirtualized;
}(react_1.default.Component));
exports.ListVirtualized = ListVirtualized;
exports.DefaultCellComponent = react_1.default.memo(function (_a) {
    var columnIndex = _a.columnIndex, rowIndex = _a.rowIndex, data = _a.data, field = _a.field;
    var children = (data[rowIndex] && utils_1.get(data[rowIndex], field.split('.'))) || [];
    return react_1.default.createElement(react_1.default.Fragment, null, children.map(function (child, i) { return react_1.default.createElement("span", { key: i },
        child,
        react_1.default.createElement("br", null)); }));
}, react_window_1.areEqual);
var defaultLoadingElement = '...';
var Cell = react_1.default.memo(function (_a) {
    var columnIndex = _a.columnIndex, rowIndex = _a.rowIndex, _b = _a.data, data = _b.data, columns = _b.columns, query = _b.query, refetch = _b.refetch, variables = _b.variables, onClick = _b.onClick, onMouseEnter = _b.onMouseEnter, onMouseLeave = _b.onMouseLeave, style = _a.style;
    if (!columns[columnIndex])
        return null;
    var field = columns[columnIndex].field;
    var CellComponent = columns[columnIndex].CellComponent || exports.DefaultCellComponent;
    var loadingElement = columns[columnIndex].loadingElement || defaultLoadingElement;
    var props = columns[columnIndex].props || {};
    var className = field.replace('.', '-');
    var id = data && data[rowIndex] && data[rowIndex].id || '';
    return (react_1.default.createElement("div", { className: "mandarina-list-row-" + (rowIndex % 2 !== 0 ? 'even' : 'odd') + " mandarina-list-cell " + className + " " + id, onClick: function () { return onClick && onClick({ data: data, rowIndex: rowIndex, field: field, columnIndex: columnIndex }); }, onMouseEnter: function () { return onMouseEnter && onMouseEnter({ data: data, rowIndex: rowIndex, field: field, columnIndex: columnIndex }); }, onMouseLeave: function () { return onMouseLeave && onMouseLeave({ data: data, rowIndex: rowIndex, field: field, columnIndex: columnIndex }); }, style: style },
        !data[rowIndex] && loadingElement,
        data[rowIndex] &&
            react_1.default.createElement(CellComponent, __assign({ columnIndex: columnIndex, rowIndex: rowIndex, data: data, field: field, refetch: refetch, variables: variables, query: query }, props))));
}, react_window_1.areEqual);
exports.getParentCellComponent = function (field, schema) {
    var from = 0;
    do {
        from = field.indexOf('.', from + 1);
        var parent_1 = field.substr(0, from);
        if (parent_1) {
            var parentDef = schema.getPathDefinition(parent_1);
            var hasParentCellComponent = parentDef && parentDef.list && parentDef.list.CellComponent;
            if (hasParentCellComponent)
                return parent_1;
        }
    } while (from > 0);
    return false;
};
//# sourceMappingURL=ListVirtualized.js.map