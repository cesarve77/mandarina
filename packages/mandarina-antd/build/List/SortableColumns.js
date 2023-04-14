"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var HideColumn_1 = __importDefault(require("./HideColumn"));
var SortButton_1 = __importDefault(require("./SortButton"));
var ListFilter_1 = __importDefault(require("./ListFilter"));
var react_sortable_hoc_1 = require("react-sortable-hoc");
// @ts-ignore
var react_resizable_1 = require("react-resizable");
exports.SortableColumn = react_sortable_hoc_1.SortableElement(function (_a) {
    var columnIndex = _a.columnIndex, _b = _a.column, title = _b.title, field = _b.field, filter = _b.filter, noSort = _b.noSort, width = _b.width, sort = _a.sort, filters = _a.filters, schema = _a.schema, onSortChange = _a.onSortChange, onResizeStop = _a.onResizeStop, onFilterChange = _a.onFilterChange, onHideColumn = _a.onHideColumn, height = _a.height;
    return (react_1.default.createElement(react_resizable_1.ResizableBox, { className: 'mandarina-list-thead-col ant-table-column-has-sorters ant-table-column-sort ' + field.replace(/\./g, '-'), width: width, height: height, handleSize: [10, 10], axis: 'x', onResizeStop: function (e, data) { return onResizeStop(field, data.size.width, columnIndex); } },
        react_1.default.createElement("div", null,
            title,
            !noSort && react_1.default.createElement(SortButton_1.default, { onSortChange: onSortChange, field: field, sort: sort })),
        filter && react_1.default.createElement(ListFilter_1.default, { onFilterChange: onFilterChange, field: field, filters: filters, filter: filters === null || filters === void 0 ? void 0 : filters[field], schema: schema }),
        react_1.default.createElement(HideColumn_1.default, { onHide: function () { return onHideColumn(field, columnIndex); } })));
});
exports.SortableColumns = react_sortable_hoc_1.SortableContainer(function (_a) {
    var children = _a.children, height = _a.height, empty = _a.empty, tHead = _a.tHead, grid = _a.grid;
    return react_1.default.createElement("div", { className: ' mandarina-list-thead-row', onWheel: function (e) {
            tHead.current.scrollLeft = tHead.current.scrollLeft + e.deltaX;
            !empty && grid.current.scrollTo({ scrollLeft: tHead.current.scrollLeft });
        }, style: { height: height } }, children);
});
//# sourceMappingURL=SortableColumns.js.map