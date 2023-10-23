"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUUID = exports.generateRandomAlpha = exports.generateRandomNumber = exports.ensureId = exports.insertParents = exports.getParentsDot = exports.getDecendentsDot = void 0;
var getDecendentsDot = function (keys, parent) {
    parent = parent.replace(/\.\d/g, '.');
    parent = parent.replace(/\.$/, '');
    var regEx = new RegExp("^".concat(parent, "\\."));
    return keys.filter(function (key) { return key.match(regEx); }).map(function (key) { return key.replace(regEx, ''); });
};
exports.getDecendentsDot = getDecendentsDot;
var getParentsDot = function (keys) {
    var parents = [];
    keys.forEach(function (key) {
        var first = key.split('.').shift();
        if (first && !parents.includes(first))
            parents.push(first);
    });
    return parents;
};
exports.getParentsDot = getParentsDot;
var insertParents = function (keys) {
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var parent_1 = key.substring(0, key.lastIndexOf('.'));
        if (parent_1 && !keys.includes(parent_1)) {
            keys.splice(i, 0, parent_1);
            i--;
        }
    }
    return keys;
};
exports.insertParents = insertParents;
var ensureId = function (fields) {
    var result = [];
    fields.forEach(function (field) {
        var dot = 1;
        var parent = field;
        while (dot > 0) {
            dot = parent.lastIndexOf('.');
            parent = parent.substr(0, dot);
            var fieldId = parent + '.id';
            if (dot > 0 && !fields.includes(fieldId) && !result.includes(fieldId)) {
                result.push(fieldId);
            }
        }
        result.push(field);
    });
    return result;
};
exports.ensureId = ensureId;
var generateRandomNumber = function (min, max) {
    if (min === void 0) { min = 0; }
    if (max === void 0) { max = 1; }
    return Math.floor(Math.random() * (max - min + 1) + min);
};
exports.generateRandomNumber = generateRandomNumber;
var generateRandomAlpha = function (n) {
    if (n === void 0) { n = 3; }
    var to = Math.floor(n / 8);
    var rest = n % 8;
    var result = '';
    for (var i = 1; i <= to; i++) {
        result += (0, exports.generateRandomNumber)(Math.pow(36, 7), Math.pow(36, 8)).toString(36);
    }
    if (rest > 0) {
        result += (0, exports.generateRandomNumber)(Math.pow(36, rest - 1), Math.pow(36, rest)).toString(36);
    }
    return result;
};
exports.generateRandomAlpha = generateRandomAlpha;
var generateUUID = function (gap) {
    if (gap === void 0) { gap = 33853318889500; }
    return (new Date().getTime() + gap).toString(36) + (0, exports.generateRandomAlpha)(16);
};
exports.generateUUID = generateUUID;
//# sourceMappingURL=utils.js.map