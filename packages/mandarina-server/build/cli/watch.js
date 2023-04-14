"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var genFiles_1 = require("./gen-files/genFiles");
var fs_1 = __importDefault(require("fs"));
var utils_1 = require("./utils");
exports.watch = function () {
    var config = utils_1.getConfig();
    if (!config)
        return;
    var dir = config.dir;
    dir.schemas.forEach(function (dir) {
        fs_1.default.watch(dir, genFiles_1.genFile);
    });
    if (dir.tables) {
        dir.tables.forEach(function (dir) {
            fs_1.default.watch(dir, genFiles_1.genFile);
        });
    }
};
//# sourceMappingURL=watch.js.map