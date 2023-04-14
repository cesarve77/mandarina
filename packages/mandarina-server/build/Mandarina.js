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
Object.defineProperty(exports, "__esModule", { value: true });
var Table_1 = require("./Table/Table");
var CustomAction_1 = require("./Action/CustomAction");
var utils_1 = require("./cli/utils");
var Mandarina = /** @class */ (function () {
    function Mandarina() {
    }
    Mandarina.load = function () {
        var config = utils_1.getConfig();
        utils_1.loadSchemas(config.dir);
    };
    Mandarina.getQuery = function () {
        var Query = {};
        for (var tableName in Table_1.Table.instances) {
            var table = Table_1.Table.getInstance(tableName);
            Query = __assign(__assign({}, Query), table.getDefaultActions('query'));
        }
        return Query;
    };
    Mandarina.getMutation = function () {
        var Mutation = {};
        for (var tableName in Table_1.Table.instances) {
            var table = Table_1.Table.getInstance(tableName);
            Mutation = __assign(__assign({}, Mutation), table.getDefaultActions('mutation'));
        }
        for (var actionName in CustomAction_1.CustomAction.instances) {
            var action = CustomAction_1.CustomAction.getInstance(actionName);
            Mutation = __assign(__assign({}, Mutation), action.getActions());
        }
        return Mutation;
    };
    Mandarina.config = {
        getUser: function (_a) {
            var user = _a.user;
            return user;
        },
    };
    Mandarina.configure = function (options) {
        if (options.getUser) {
            Mandarina.config.getUser = options.getUser;
        }
    };
    return Mandarina;
}());
exports.default = Mandarina;
//# sourceMappingURL=Mandarina.js.map