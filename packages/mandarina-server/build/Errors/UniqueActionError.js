"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueActionError = void 0;
var BaseError_1 = __importDefault(require("mandarina/build/Errors/BaseError"));
var UniqueActionError = /** @class */ (function (_super) {
    __extends(UniqueActionError, _super);
    function UniqueActionError(schemaName) {
        var name = typeof schemaName === "string" ? schemaName : schemaName.name;
        return _super.call(this, "The action \"".concat(name, "\" already exists, action name should be unique.")) || this;
    }
    return UniqueActionError;
}(BaseError_1.default));
exports.UniqueActionError = UniqueActionError;
//# sourceMappingURL=UniqueActionError.js.map