"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equalityFn = function (newArgs, lastArgs) {
    return newArgs.length === lastArgs.length &&
        newArgs.every(function (newArg, index) {
            return newArg === lastArgs[index];
        });
};
//# sourceMappingURL=utils.js.map