"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyObject = void 0;
const is_regexp_1 = __importDefault(require("is-regexp"));
const is_obj_1 = __importDefault(require("is-obj"));
// @ts-ignore
const get_own_enumerable_keys_1 = __importDefault(require("get-own-enumerable-keys"));
function stringifyObject(input, options, pad) {
    const seen = [];
    return (function stringify(input, options = {}, pad = '') {
        const indent = options.indent || '\t';
        let tokens;
        if (options.inlineCharacterLimit === undefined) {
            tokens = {
                newline: '\n',
                newlineOrSpace: '\n',
                pad,
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
        const expandWhiteSpace = (string) => {
            if (options.inlineCharacterLimit === undefined) {
                return string;
            }
            const oneLined = string
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
            || (0, is_regexp_1.default)(input)) {
            return String(input);
        }
        if (input instanceof Date) {
            return `new Date('${input.toISOString()}')`;
        }
        if (Array.isArray(input)) {
            if (input.length === 0) {
                return '[]';
            }
            seen.push(input);
            const returnValue = '[' + tokens.newline + input.map((element, i) => {
                const eol = input.length - 1 === i ? tokens.newline : ',' + tokens.newlineOrSpace;
                let value = stringify(element, options, pad + indent);
                if (options.transform) {
                    value = options.transform(input, i, value);
                }
                return tokens.indent + value + eol;
            }).join('') + tokens.pad + ']';
            seen.pop();
            return expandWhiteSpace(returnValue);
        }
        if ((0, is_obj_1.default)(input)) {
            let objectKeys = (0, get_own_enumerable_keys_1.default)(input);
            if (options.filter) {
                // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
                // @ts-ignore
                objectKeys = objectKeys.filter(element => options.filter(input, element));
            }
            if (objectKeys.length === 0) {
                return '{}';
            }
            seen.push(input);
            const returnValue = '{' + tokens.newline + objectKeys.map((element, index) => {
                const eol = objectKeys.length - 1 === index ? tokens.newline : ',' + tokens.newlineOrSpace;
                const isSymbol = typeof element === 'symbol';
                const isClassic = !isSymbol && /^[a-z$_][$\w]*$/i.test(element);
                const key = isSymbol || isClassic ? element : stringify(element, options);
                let value = stringify(input[element], options, pad + indent);
                if (options.transform) {
                    value = options.transform(input, element, value);
                }
                return tokens.indent + String(key) + ': ' + value + eol;
            }).join('') + tokens.pad + '}';
            seen.pop();
            return expandWhiteSpace(returnValue);
        }
        input = input.replace(/\\/g, '\\\\');
        input = String(input).replace(/[\r\n]/g, x => x === '\n' ? '\\n' : '\\r');
        if (options.singleQuotes === false) {
            input = input.replace(/"/g, '\\"');
            return `"${input}"`;
        }
        input = input.replace(/'/g, '\\\'');
        return `'${input}'`;
    })(input, options, pad);
}
exports.stringifyObject = stringifyObject;
//# sourceMappingURL=stringify-object.js.map