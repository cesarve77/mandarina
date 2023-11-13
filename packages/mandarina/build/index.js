"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Find = exports.FindOne = exports.Update = exports.Create = exports.Schema = exports.Auth = exports.Integer = exports.Delete = void 0;
var Schema_1 = require("./Schema/Schema");
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return Schema_1.Schema; } });
var Auth_1 = __importDefault(require("./Auth/Auth"));
exports.Auth = Auth_1.default;
var Mutate_1 = require("./Operations/Mutate");
Object.defineProperty(exports, "Create", { enumerable: true, get: function () { return Mutate_1.Create; } });
var Mutate_2 = require("./Operations/Mutate");
Object.defineProperty(exports, "Update", { enumerable: true, get: function () { return Mutate_2.Update; } });
var Mutate_3 = require("./Operations/Mutate");
Object.defineProperty(exports, "Delete", { enumerable: true, get: function () { return Mutate_3.Delete; } });
var Find_1 = require("./Operations/Find");
Object.defineProperty(exports, "FindOne", { enumerable: true, get: function () { return Find_1.FindOne; } });
var Find_2 = require("./Operations/Find");
Object.defineProperty(exports, "Find", { enumerable: true, get: function () { return Find_2.Find; } });
var Schema_2 = require("./Schema/Schema");
Object.defineProperty(exports, "Integer", { enumerable: true, get: function () { return Schema_2.Integer; } });
//# sourceMappingURL=index.js.map