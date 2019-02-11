"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mandarina_1 = require("mandarina");
var utils_1 = require("mandarina/build/Schema/utils");
var Table_1 = require("./Table");
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
                var schema = mandarina_1.Schema.getInstance(type[0]);
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
                var schema = mandarina_1.Schema.getInstance(type);
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
                var schemaName = mandarina_1.Schema.getInstance(type[0]).name;
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
exports.buildInterfaceName = function (schema) { return schema instanceof mandarina_1.Schema ? schema.name + "Interface" : schema + "Interface"; };
exports.getDeclarations = function (schema) {
    var headers = [];
    var path = require('path');
    var schemaDeclarationName = exports.buildInterfaceName(schema);
    var declarations = ["export interface " + schemaDeclarationName + " {"];
    for (var _i = 0, _a = schema.keys; _i < _a.length; _i++) {
        var key = _a[_i];
        var field = schema.getFieldDefinition(key);
        var optional = utils_1.isRequired(field) || key === 'id' ? '' : '?';
        var fieldType = exports.getDeclarationType(field.type, key);
        var schemaName = "";
        if (Array.isArray(field.type) && typeof field.type[0] === 'string') {
            schemaName = field.type[0];
        }
        if (typeof field.type === 'string')
            schemaName = field.type;
        if (schemaName) {
            var childSchema = mandarina_1.Schema.getInstance(schemaName);
            var interfaceName = exports.buildInterfaceName(schemaName);
            var dir = path.relative(schema.getFilePath(), childSchema.getFilePath());
            if (!dir) {
                dir = '.';
            }
            else if (dir.indexOf('.') !== 0) {
                dir = './' + dir;
            }
            headers.push("import { " + interfaceName + " } from \"" + dir + "/" + interfaceName + "\"");
        }
        field.description && declarations.push("// " + field.description);
        declarations.push("    " + key + optional + ": " + fieldType + " " + (optional ? ' | null' : ''));
    }
    declarations.push('}');
    return headers.concat(declarations).join('\n');
};
var getMainSchema = function (schema, type) {
    var mainSchema = [];
    for (var _i = 0, _a = schema.keys; _i < _a.length; _i++) {
        var key = _a[_i];
        if (key === 'id' && type === 'type') {
            if (!!Table_1.Table.instances[schema.name]) {
                mainSchema.push("id: ID! @unique");
            }
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
    var description = capitalize(type) + " for " + name;
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