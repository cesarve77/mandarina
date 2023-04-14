"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var CustomAction_1 = require("./Action/CustomAction");
exports.CustomAction = CustomAction_1.CustomAction;
var Table_1 = require("./Table/Table");
exports.Table = Table_1.Table;
var Mandarina_1 = __importDefault(require("./Mandarina"));
var utils_1 = require("./cli/utils");
exports.getConfig = utils_1.getConfig;
var Action = CustomAction_1.CustomAction; //for backward compatibility
exports.Action = Action;
exports.default = Mandarina_1.default;
//# sourceMappingURL=index.js.map