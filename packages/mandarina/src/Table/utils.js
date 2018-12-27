"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inflection = require("inflection");
var Schema_1 = require("../Schema/Schema");
var utils_1 = require("../Schema/utils");
var Table_1 = require("./Table");
/**
 * Upper case the first latter
 * @param  string - string to be upper cased
 */
exports.capitalize = function (string) {
    var result = string.trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
};
/**
 * Lower case the first latter
 * @param  string - string to be Lower cased
 */
exports.lowerize = function (string) {
    var result = string.trim();
    return result.charAt(0).toLowerCase() + result.slice(1);
};
exports.pluralize = function (str) {
    var result = inflection.underscore(str).trim();
    result = inflection.humanize(result);
    var resultSplit = result.split(' ');
    var lastWord = resultSplit.pop();
    lastWord = inflection.pluralize(lastWord);
    return inflection.camelize(resultSplit.concat([lastWord]).join('_'), true);
};
exports.singularize = function (str) {
    var result = inflection.underscore(str).trim();
    result = inflection.humanize(result);
    var resultSplit = result.split(' ');
    var lastWord = resultSplit.pop();
    lastWord = inflection.singularize(lastWord);
    return inflection.camelize(resultSplit.concat([lastWord]).join('_'), true);
};
exports.getDeclarationType = function (type, key) {
    var typeName = type;
    if (type.name)
        typeName = type.name;
    if (Array.isArray(type))
        typeName = 'Array';
    switch (typeName) {
        case 'String':
            return "string";
        case 'Boolean':
            return "boolean";
        case 'Number':
            return "number";
        case 'Integer':
            return "number";
        case 'Array':
            if (typeof type[0] === 'string') {
                var schema = Schema_1.Schema.getInstance(type[0]);
                var interfaceName = exports.buildInterfaceName(schema);
                return interfaceName + "[]";
            }
            var scalarName = exports.getDeclarationType(type[0], key);
            return scalarName + "[]";
        case 'Object':
            throw new Error("Error in field definition " + key + ". Fields Table definitions do not accept objects, please use composite tables");
        case 'Date':
            return "Date";
        default:
            if (typeof type === 'string') {
                var schema = Schema_1.Schema.getInstance(type);
                var interfaceName = exports.buildInterfaceName(schema);
                return "" + interfaceName;
            }
            throw new Error("Error in field definition " + key + ". Fields Table definitions do not accept objects, please use composite tables");
    }
};
exports.getGraphQLType = function (type, key, required) {
    //if (isBrowser) throw new Error('_functionCreator is not avaiblabe on browser')
    if (required === void 0) { required = ''; }
    var typeName = type;
    if (type.name)
        typeName = type.name;
    if (Array.isArray(type))
        typeName = 'Array';
    switch (typeName) {
        case 'String':
            return "String" + required;
        case 'Boolean':
            return "Boolean" + required;
        case 'Number':
            return "Float" + required;
        case 'Integer':
            return "Int" + required;
        case 'Array':
            if (typeof type[0] === 'string') {
                var schemaName = Schema_1.Schema.getInstance(type[0]).name;
                return "[" + schemaName + "!]!";
            }
            var scalarName = exports.getGraphQLType(type[0], key);
            return "[" + scalarName + "!]" + required;
        case 'Object':
            throw new Error("Error in field definition " + key + ". Fields Table definitions do not accept objects, please use composite tables");
        case 'Date':
            return "DateTime";
        default:
            return typeName;
    }
};
exports.buildInterfaceName = function (schema) { return schema instanceof Table_1.Table ? schema.name + "TableInterface" : schema + "TableInterface"; };
exports.getDeclarations = function (schema) {
    var headers = [];
    var path = require('path');
    var declarations = ["export interface " + exports.buildInterfaceName(schema) + " {"];
    for (var _i = 0, _a = schema.keys; _i < _a.length; _i++) {
        var key = _a[_i];
        var field = schema.getFieldDefinition(key);
        var optional = utils_1.isRequired(field) ? '' : '?';
        var fieldType = exports.getDeclarationType(field.type, key);
        var schemaName = "";
        if (Array.isArray(field.type) && typeof field.type[0] === 'string')
            schemaName = field.type[0];
        if (typeof field.type === 'string')
            schemaName = field.type;
        if (schemaName) {
            var childSchema = Schema_1.Schema.getInstance(schemaName);
            var interfaceName = exports.buildInterfaceName(schemaName);
            var dir = path.relative(schema.getFilePath(), childSchema.getFilePath());
            headers.push("import {" + interfaceName + "} from \"" + (dir ? dir : '.') + "/" + interfaceName + "\"");
        }
        field.description && declarations.push("// " + field.description);
        declarations.push("    " + key + optional + ": " + fieldType);
    }
    declarations.push('}');
    return headers.concat(declarations).join('\n');
};
var getMainSchema = function (schema, type) {
    var mainSchema = [];
    for (var _i = 0, _a = schema.keys; _i < _a.length; _i++) {
        var key = _a[_i];
        if (key === 'id' && !schema.options.virtual) {
            mainSchema.push("id: ID! @unique");
            continue;
        }
        var field = schema.getFieldDefinition(key);
        var required = utils_1.isRequired(field) ? '!' : '';
        var unique = type === 'type' && field.unique ? '@unique' : '';
        var fieldType = exports.getGraphQLType(field.type, key, required);
        field.description && mainSchema.push("# " + field.description);
        mainSchema.push(key + ": " + fieldType + " " + unique);
    }
    return mainSchema;
};
var getGraphQL = function (type, schema) {
    var name = schema.name;
    //if (isBrowser) throw new Error('getGraphQLSchema is not available on browser')
    var mainSchema = getMainSchema(schema, type), graphQLSchema = '';
    var description = exports.capitalize(type) + " for " + name;
    if (mainSchema.length) {
        graphQLSchema += "# " + description + "\n";
        graphQLSchema += type + " " + name + (type === 'input' ? 'Input' : '') + " {\n";
        graphQLSchema += "\t" + mainSchema.join('\n\t') + "\n";
        graphQLSchema += "}";
    }
    return graphQLSchema;
};
exports.getGraphQLModel = function (schema) { return getGraphQL('type', schema); };
exports.getGraphQLInput = function (schema) { return getGraphQL('input', schema); };
exports.sleep = function (ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
};
