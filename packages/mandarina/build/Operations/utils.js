"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var flat_1 = require("flat");
var utils_1 = require("../utils");
var stringify_object_1 = __importDefault(require("stringify-object"));
/**
 * get grqphql string from a list of field in dot notation
 * @param  keys - list of fields in dot notation
 * @return  grqphql string
 */
exports.buildQueryFromFields = function (keys, sureId) {
    if (sureId === void 0) { sureId = true; }
    var fields = __spreadArrays(keys);
    if (sureId && !fields.includes('id')) {
        fields.push('id');
    }
    fields = fields.map(function (field) { return field.replace(/\.\$(\.?)/g, '$1'); });
    if (sureId)
        fields = utils_1.ensureId(fields);
    var fieldsFlat = fields.reduce(function (obj, key) {
        var _a;
        return Object.assign(obj, (_a = {}, _a[key] = {}, _a));
    }, {});
    var obj = flat_1.unflatten(fieldsFlat);
    return JSON.stringify(obj).replace(/\{\}|\"|\:|null/g, '');
};
exports.insertHaving = function (qs, having) {
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
                return v + ":" + having[inserts[i]][v];
            }
            return v + ":" + stringify_object_1.default(having[inserts[i]][v], {
                indent: '',
                singleQuotes: false
            });
        }).join(',');
        result = result.slice(0, i) + "(" + txt.replace(/("|\(|\))/g, "\$1") + ")" + result.slice(i);
    };
    for (var i = inserts.length - 1; i >= 0; i--) {
        _loop_1(i);
    }
    return ("{" + result + "}").replace(/\n|\t/g, '');
};
//# sourceMappingURL=utils.js.map