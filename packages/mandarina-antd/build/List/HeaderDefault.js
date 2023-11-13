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
var col_1 = __importDefault(require("antd/lib/col"));
var menu_1 = __importDefault(require("antd/lib/menu"));
var row_1 = __importDefault(require("antd/lib/row"));
var antd_1 = require("antd");
var getOption = function (optionName) {
    return false;
};
var HeaderDefault = function (_a) {
    var leftButtons = _a.leftButtons, _b = _a.counter, counter = _b === void 0 ? true : _b, _c = _a.menuItems, menuItems = _c === void 0 ? [] : _c, count = _a.count, props = __rest(_a, ["leftButtons", "counter", "menuItems", "count"]);
    var _d = react_1.useState(false), loadingAction = _d[0], setLoadingAction = _d[1];
    var menu = menuItems.map(function (item, index) {
        if (typeof item === 'string') {
            var existingOption = getOption(item);
            if (existingOption) {
                return existingOption;
            }
            else {
                throw new Error("List menu option named " + item + " do not exist");
            }
        }
        var action = item.action, content = item.content;
        var onClick = function () {
            setLoadingAction(true);
            var result = action && action(__assign({ count: count }, props));
            if (result instanceof Promise) {
                result
                    .then(function () { return setLoadingAction(false); })
                    .catch(function () { return setLoadingAction(false); });
            }
            else {
                setLoadingAction(false);
            }
        };
        // @ts-ignore
        if (react_1.default.isValidElement(content) && content.type.name !== 'SubMenu' && content.type.name !== "Menu") {
            var _a = item.props || {}, disabled = _a.disabled, props_1 = __rest(_a, ["disabled"]);
            if (typeof disabled === 'function')
                disabled = disabled(count);
            return react_1.default.createElement(menu_1.default.Item, __assign({}, props_1, { disabled: disabled, key: index, onClick: onClick }), content);
        }
        if (typeof content === 'function') {
            // @ts-ignore
            return content(__assign({ count: count, setLoadingAction: setLoadingAction }, props));
        }
        return content;
    });
    return (react_1.default.createElement(row_1.default, { gutter: 0, className: 'mandarina-list-menu' },
        react_1.default.createElement(col_1.default, { xs: 5, sm: 4, md: 3, lg: 2, xl: 2, xxl: 1 },
            counter && "Total: " + (count === 0 || count ? count : '...'),
            leftButtons),
        !!menu.length && react_1.default.createElement(col_1.default, { xs: 19, sm: 20, md: 21, lg: 22, xl: 22, xxl: 23, style: { textAlign: 'right' } },
            react_1.default.createElement(antd_1.Spin, { spinning: loadingAction },
                react_1.default.createElement(menu_1.default, { className: 'mandarina-list-menu-btn', mode: 'horizontal' }, menu)))));
};
exports.default = HeaderDefault;
//# sourceMappingURL=HeaderDefault.js.map