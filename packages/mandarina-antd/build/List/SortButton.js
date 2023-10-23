"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var icon_1 = __importDefault(require("antd/lib/icon"));
var prefixCls = 'mandarina';
var SortButton = function (_a) {
    var _b = _a.sort, sort = _b === void 0 ? {} : _b, field = _a.field, onSortChange = _a.onSortChange;
    var isAscend = sort[field] === 1;
    var isDescend = sort[field] === -1;
    var onClick = function (defaultDirection) {
        var direction = sort[field] !== undefined ? sort[field] > 0 ? -1 : 1 : defaultDirection;
        onSortChange(field, direction);
    };
    var ascend = (react_1.default.createElement(icon_1.default, { onClick: function () { return onClick(1); }, className: "".concat(prefixCls, "-column-sorter-up ").concat(isAscend ? 'on' : 'off'), type: "caret-up", theme: "filled" }));
    var descend = (react_1.default.createElement(icon_1.default, { onClick: function () { return onClick(-1); }, className: "".concat(prefixCls, "-column-sorter-down ").concat(isDescend ? 'on' : 'off'), type: "caret-down", theme: "filled" }));
    return (react_1.default.createElement("div", { onClick: function () { return onClick(1); }, title: 'sort', className: "".concat(prefixCls, "-column-sorter-inner ").concat(prefixCls, "-column-sorter-inner-full"), key: "sorter" },
        ascend,
        descend));
};
exports.default = SortButton;
//# sourceMappingURL=SortButton.js.map