"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
function getBooleanArgumentValue(info, ast) {
    var argument = ast.arguments[0].value;
    switch (argument.kind) {
        case 'BooleanValue':
            return argument.value;
        case 'Variable':
            return info.variableValues[argument.name.value];
    }
}
// @ts-ignore
function isExcludedByDirective(info, ast) {
    var directives = ast.directives || [];
    var isExcluded = false;
    // @ts-ignore
    directives.forEach(function (directive) {
        switch (directive.name.value) {
            case 'include':
                isExcluded = isExcluded || !getBooleanArgumentValue(info, directive);
                break;
            case 'skip':
                isExcluded = isExcluded || getBooleanArgumentValue(info, directive);
                break;
        }
    });
    return isExcluded;
}
// @ts-ignore
function dotConcat(a, b) {
    return a ? a + "." + b : b;
}
// @ts-ignore
function getFieldSet(info, asts, prefix) {
    if (asts === void 0) { asts = info.fieldASTs || info.fieldNodes; }
    if (prefix === void 0) { prefix = ''; }
    // for recursion: fragments doesn't have many sets
    if (!Array.isArray(asts)) {
        asts = [asts];
    }
    // @ts-ignore
    var selections = asts.reduce(function (selections, source) {
        if (source && source.selectionSet && source.selectionSet.selections) {
            selections.push.apply(selections, source.selectionSet.selections);
        }
        return selections;
    }, []);
    // @ts-ignore
    return selections.reduce(function (set, ast) {
        if (isExcludedByDirective(info, ast)) {
            return set;
        }
        switch (ast.kind) {
            case 'Field':
                var newPrefix = dotConcat(prefix, ast.name.value);
                console.dir(JSON.parse(JSON.stringify(ast.arguments)), { depth: null });
                if (ast.selectionSet) {
                    return Object.assign({}, set, getFieldSet(info, ast, newPrefix));
                }
                else {
                    set[newPrefix] = true;
                    return set;
                }
            case 'InlineFragment':
                return Object.assign({}, set, getFieldSet(info, ast, prefix));
            case 'FragmentSpread':
                return Object.assign({}, set, getFieldSet(info, info.fragments[ast.name.value], prefix));
        }
    }, {});
}
// @ts-ignore
function getFieldList(info) {
    console.dir(JSON.parse(JSON.stringify(info)), { depth: null });
    return Object.keys(getFieldSet(info));
}
exports.default = getFieldList;
;
//# sourceMappingURL=graphql-resolve-info.js.map