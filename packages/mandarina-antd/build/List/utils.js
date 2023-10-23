"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalityFn = void 0;
var equalityFn = function (newArgs, lastArgs) {
    return newArgs.length === lastArgs.length &&
        newArgs.every(function (newArg, index) {
            return newArg === lastArgs[index];
        });
};
exports.equalityFn = equalityFn;
//# sourceMappingURL=utils.js.map