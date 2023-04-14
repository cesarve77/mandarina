"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var icon_1 = __importDefault(require("antd/lib/icon"));
var HideColumn = function (_a) {
    var onHide = _a.onHide;
    return (react_1.default.createElement(icon_1.default, { type: "close", onClick: onHide, className: 'mandarina-hide-column' }));
};
exports.default = HideColumn;
//# sourceMappingURL=HideColumn.js.map