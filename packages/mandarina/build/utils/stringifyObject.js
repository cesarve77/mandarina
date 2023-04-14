"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isObject = function (value) { return value !== null && typeof value === "object"; };
var isRegexp = function (value) { return isObject(value) && value.constructor.name === "RegExp"; };
function stringifyObject(input, options, pad) {
    var seen = [];
    return (function stringify(input, options, pad) {
        if (options === void 0) { options = {}; }
        if (pad === void 0) { pad = ''; }
        var indent = options.indent || '\t';
        var tokens;
        if (options.inlineCharacterLimit === undefined) {
            tokens = {
                newline: '\n',
                newlineOrSpace: '\n',
                pad: pad,
                indent: pad + indent,
            };
        }
        else {
            tokens = {
                newline: '@@__STRINGIFY_OBJECT_NEW_LINE__@@',
                newlineOrSpace: '@@__STRINGIFY_OBJECT_NEW_LINE_OR_SPACE__@@',
                pad: '@@__STRINGIFY_OBJECT_PAD__@@',
                indent: '@@__STRINGIFY_OBJECT_INDENT__@@',
            };
        }
        var expandWhiteSpace = function (string) {
            if (options.inlineCharacterLimit === undefined) {
                return string;
            }
            var oneLined = string
                .replace(new RegExp(tokens.newline, 'g'), '')
                .replace(new RegExp(tokens.newlineOrSpace, 'g'), ' ')
                .replace(new RegExp(tokens.pad + '|' + tokens.indent, 'g'), '');
            if (oneLined.length <= options.inlineCharacterLimit) {
                return oneLined;
            }
            return string
                .replace(new RegExp(tokens.newline + '|' + tokens.newlineOrSpace, 'g'), '\n')
                .replace(new RegExp(tokens.pad, 'g'), pad)
                .replace(new RegExp(tokens.indent, 'g'), pad + indent);
        };
        if (seen.includes(input)) {
            return '"[Circular]"';
        }
        if (input === null
            || input === undefined
            || typeof input === 'number'
            || typeof input === 'boolean'
            || typeof input === 'function'
            || typeof input === 'symbol'
            || isRegexp(input)) {
            return String(input);
        }
        if (input instanceof Date) {
            return "new Date('" + input.toISOString() + "')";
        }
        if (Array.isArray(input)) {
            if (input.length === 0) {
                return '[]';
            }
            seen.push(input);
            var returnValue = '[' + tokens.newline + input.map(function (element, i) {
                var eol = input.length - 1 === i ? tokens.newline : ',' + tokens.newlineOrSpace;
                var value = stringify(element, options, pad + indent);
                if (options.transform) {
                    value = options.transform(input, i, value);
                }
                return tokens.indent + value + eol;
            }).join('') + tokens.pad + ']';
            seen.pop();
            return expandWhiteSpace(returnValue);
        }
        if (isObject(input)) {
            var objectKeys_1 = Object.keys(input);
            if (options.filter) {
                // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
                // @ts-ignore
                objectKeys_1 = objectKeys_1.filter(function (element) { return options.filter(input, element); });
            }
            if (objectKeys_1.length === 0) {
                return '{}';
            }
            seen.push(input);
            var returnValue = '{' + tokens.newline + objectKeys_1.map(function (element, index) {
                var eol = objectKeys_1.length - 1 === index ? tokens.newline : ',' + tokens.newlineOrSpace;
                var isSymbol = typeof element === 'symbol';
                var isClassic = !isSymbol && /^[a-z$_][$\w]*$/i.test(element);
                var key = isSymbol || isClassic ? element : stringify(element, options);
                var value = stringify(input[element], options, pad + indent);
                if (options.transform) {
                    value = options.transform(input, element, value);
                }
                return tokens.indent + String(key) + ': ' + value + eol;
            }).join('') + tokens.pad + '}';
            seen.pop();
            return expandWhiteSpace(returnValue);
        }
        input = input.replace(/\\/g, '\\\\');
        input = String(input).replace(/[\r\n]/g, function (x) { return x === '\n' ? '\\n' : '\\r'; });
        if (options.singleQuotes === false) {
            input = input.replace(/"/g, '\\"');
            return "\"" + input + "\"";
        }
        input = input.replace(/'/g, '\\\'');
        return "'" + input + "'";
    })(input, options, pad);
}
exports.stringifyObject = stringifyObject;
//# sourceMappingURL=stringifyObject.js.map