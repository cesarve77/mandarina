"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = exports.Action = exports.CustomAction = exports.getConfig = void 0;
var CustomAction_1 = require("./Action/CustomAction");
Object.defineProperty(exports, "CustomAction", { enumerable: true, get: function () { return CustomAction_1.CustomAction; } });
var Table_1 = require("./Table/Table");
Object.defineProperty(exports, "Table", { enumerable: true, get: function () { return Table_1.Table; } });
var Mandarina_1 = __importDefault(require("./Mandarina"));
var utils_1 = require("./cli/utils");
Object.defineProperty(exports, "getConfig", { enumerable: true, get: function () { return utils_1.getConfig; } });
var Action = CustomAction_1.CustomAction; //for backward compatibility
exports.Action = Action;
exports.default = Mandarina_1.default;
//# sourceMappingURL=index.js.map