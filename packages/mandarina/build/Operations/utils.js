"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertHaving = exports.buildQueryFromFields = void 0;
var flat_1 = require("flat");
var utils_1 = require("../utils");
var stringify_object_1 = __importDefault(require("stringify-object"));
/**
 * get grqphql string from a list of field in dot notation
 * @param  keys - list of fields in dot notation
 * @return  grqphql string
 */
var buildQueryFromFields = function (keys, sureId) {
    if (sureId === void 0) { sureId = true; }
    var fields = __spreadArray([], keys, true);
    if (sureId && !fields.includes('id')) {
        fields.push('id');
    }
    fields = fields.map(function (field) { return field.replace(/\.\$(\.?)/g, '$1'); });
    if (sureId)
        fields = (0, utils_1.ensureId)(fields);
    var fieldsFlat = fields.reduce(function (obj, key) {
        var _a;
        return Object.assign(obj, (_a = {}, _a[key] = {}, _a));
    }, {});
    var obj = (0, flat_1.unflatten)(fieldsFlat);
    return JSON.stringify(obj).replace(/\{\}|\"|\:|null/g, '');
};
exports.buildQueryFromFields = buildQueryFromFields;
var insertHaving = function (qs, having) {
    if (!having)
        return qs;
    qs = qs.substring(1, qs.length - 1);
    var inserts = [];
    var parents = [];
    var havingParents = Object.keys(having);
    for (var i = 0; i < qs.length; i++) {
        var c = qs[i];
        if (c === '{') {
            var sub = qs.substring(0, i);
            var regEx = (/(\w+$)/);
            // @ts-ignore
            var lastWord = regEx.exec(sub)[0];
            parents.push(lastWord);
            var path = parents.join('.');
            if (havingParents.includes(path)) {
                inserts[i] = path;
            }
        }
        if (c === '}') {
            parents.pop();
        }
    }
    var result = qs;
    var _loop_1 = function (i) {
        if (!inserts[i])
            return "continue";
        var variables = Object.keys(having[inserts[i]]);
        var txt = variables.map(function (v) {
            if (v === 'orderBy') {
                return "".concat(v, ":").concat(having[inserts[i]][v]);
            }
            return "".concat(v, ":").concat((0, stringify_object_1.default)(having[inserts[i]][v], {
                indent: '',
                singleQuotes: false
            }));
        }).join(',');
        result = "".concat(result.slice(0, i), "(").concat(txt.replace(/("|\(|\))/g, "\$1"), ")").concat(result.slice(i));
    };
    for (var i = inserts.length - 1; i >= 0; i--) {
        _loop_1(i);
    }
    return "{".concat(result, "}").replace(/\n|\t/g, '');
};
exports.insertHaving = insertHaving;
//# sourceMappingURL=utils.js.map