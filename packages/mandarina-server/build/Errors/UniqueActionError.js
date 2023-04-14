"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var BaseError_1 = __importDefault(require("mandarina/build/Errors/BaseError"));
var UniqueActionError = /** @class */ (function (_super) {
    __extends(UniqueActionError, _super);
    function UniqueActionError(schemaName) {
        var _this = this;
        var name = typeof schemaName === "string" ? schemaName : schemaName.name;
        _this = _super.call(this, "The action \"" + name + "\" already exists, action name should be unique.") || this;
        return _this;
    }
    return UniqueActionError;
}(BaseError_1.default));
exports.UniqueActionError = UniqueActionError;
//# sourceMappingURL=UniqueActionError.js.map