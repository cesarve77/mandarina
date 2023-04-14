"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mandarina_1 = require("mandarina");
var utils_1 = require("mandarina/build/Schema/utils");
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var lodash_1 = require("lodash");
//
// export const getDeclarationType = (type: any, key: string): string => {
//
//     let typeName = type
//     if (type.name) typeName = type.name
//     if (Array.isArray(type)) typeName = 'Array'
//     switch (typeName) {
//         case 'String':
//             return `string`;
//
//         case 'Boolean':
//             return `boolean`;
//
//         case 'Number':
//             return `number`;
//
//         case 'Integer':
//             return `number`;
//
//         case 'Array':
//             if (typeof type[0] === 'string') {
//                 const schema = Schema.getInstance(type[0])
//                 const interfaceName = buildInterfaceName(schema)
//
//                 return `${interfaceName}[]`
//             }
//             const scalarName = getDeclarationType(type[0], key)
//             return `${scalarName}[]`
//         case 'Object':
//             throw new Error(`Error in field definition ${key}. Fields Table definitions do not accept objects, please use composite tables`)
//
//         case 'Date':
//             return `Date`;
//         default:
//             if (typeof type === 'string') {
//                 const schema = Schema.getInstance(type)
//                 const interfaceName = buildInterfaceName(schema)
//                 return `${interfaceName}`
//             }
//             throw new Error(`Error in field definition ${key}. Fields Table definitions do not accept objects, please use composite tables`)
//     }
// }
exports.getGraphQLType = function (def, key, required, isInput) {
    if (required === void 0) { required = ''; }
    if (isInput === void 0) { isInput = false; }
    //if (isBrowser) throw new Error('_functionCreator is not avaiblabe on browser')
    var input = isInput ? 'Input' : '';
    switch (true) {
        case (!def.isArray && !def.isTable && def.type.name === 'String'):
            return "String" + required;
        case (!def.isArray && !def.isTable && def.type.name === 'Boolean'):
            return "Boolean" + required;
        case (!def.isArray && !def.isTable && def.type.name === 'Number'):
            return "Float" + required;
        case (!def.isArray && !def.isTable && def.type.name === 'Integer'):
            return "Int" + required;
        case (!def.isArray && !def.isTable && def.type.name === 'Date'):
            return "DateTime" + required;
        case (def.isArray && def.isTable):
            return "[" + def.type + input + "!]" + required;
        case (def.isArray && !def.isTable):
            var scalarName = exports.getGraphQLType(__assign(__assign({}, def), { isArray: false }), key);
            return "[" + scalarName + "!]" + required;
        default:
            var schemaName = def.type;
            if (isInput && def.isTable && def.form && def.form.props && def.form.props.query) {
                return schemaName + "WhereUnique" + input + required;
            }
            return def.type + input + required;
    }
};
// export const buildInterfaceName = (schema: Schema | string): string => schema instanceof Schema ? `${schema.name}Interface` : `${schema}Interface`
var getMainSchema = function (schema, type) {
    var mainSchema = [];
    for (var _i = 0, _a = schema.keys; _i < _a.length; _i++) {
        var key = _a[_i];
        if (key === 'id' && type === 'type') {
            mainSchema.push("id: ID! @id");
            continue;
        }
        var fieldDefinition = schema.getPathDefinition(key);
        var required = utils_1.isRequired(fieldDefinition) ? '!' : '';
        var unique = type === 'type' && fieldDefinition.table.unique ? '@unique' : '';
        var defaultValue = '';
        if (type === 'type' && fieldDefinition.table.default !== undefined) {
            var wrapper = (fieldDefinition.type === String) ? '"' : '';
            defaultValue = "@default(value: " + wrapper + fieldDefinition.table.default + wrapper + ")";
        }
        var rename = (type === 'type' && fieldDefinition.table.rename !== undefined) ? "@rename(oldName: \"" + fieldDefinition.table.default + "\")" : '';
        var relations = [];
        var relation = '';
        if (type === 'type' && fieldDefinition.table.relation !== undefined) {
            if (typeof fieldDefinition.table.relation === "string") {
                relations.push("name: \"" + fieldDefinition.table.relation + "\"");
            }
            else {
                if (fieldDefinition.table.relation.link) {
                    relations.push("link: " + fieldDefinition.table.relation.link);
                }
                if (fieldDefinition.table.relation.name) {
                    relations.push("name: \"" + fieldDefinition.table.relation.name + "\"");
                }
                if (fieldDefinition.table.relation.onDelete) {
                    relations.push("onDelete: " + fieldDefinition.table.relation.onDelete);
                }
            }
            if (relations.length > 0) {
                relation = "@relation(" + relations.join(', ') + ")";
            }
        }
        var scalarList = '', createdAt = '', updatedAt = '';
        if (type === 'type' && fieldDefinition.table.scalarList) {
            scalarList = "@scalarList(strategy: " + fieldDefinition.table.scalarList.strategy + ")";
        }
        if (type === 'type' && (fieldDefinition.table.createdAt === true || (fieldDefinition.table.createdAt !== false && key === 'createdAt'))) {
            createdAt = "@createdAt";
        }
        if (type === 'type' && (fieldDefinition.table.updatedAt === true || (fieldDefinition.table.updatedAt !== false && key === 'updatedAt'))) {
            createdAt = "@updatedAt";
        }
        if (!scalarList && type === 'type' && fieldDefinition.isArray && !fieldDefinition.isTable) {
            scalarList = "@scalarList(strategy: RELATION)";
        }
        var fieldType = exports.getGraphQLType(fieldDefinition, key, required, type === 'input');
        fieldDefinition.description && mainSchema.push("# " + fieldDefinition.description);
        mainSchema.push(key + ": " + fieldType + " " + unique + " " + createdAt + " " + updatedAt + " " + defaultValue + " " + relation + " " + scalarList + " " + rename);
    }
    return mainSchema;
};
var getGraphQL = function (type, schema) {
    var name = schema.name;
    //if (isBrowser) throw new Error('getGraphQLSchema is not available on browser')
    var mainSchema = getMainSchema(schema, type), graphQLSchema = '';
    var description = utils_1.capitalize(type) + " for " + name;
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
exports.createDir = function (dir) {
    var prismaDir = path_1.default.join(process.cwd(), dir);
    if (!fs_1.default.existsSync(prismaDir + "/datamodel")) {
        fs_1.default.mkdirSync(prismaDir + "/datamodel");
    }
};
exports.saveFile = function (dir, fileName, content, fileType) {
    var prismaDir = path_1.default.join(process.cwd(), dir);
    var fileAbs = prismaDir + "/datamodel/" + fileName + "." + fileType + ".graphql";
    fs_1.default.writeFileSync(fileAbs, content);
    console.info("saving " + fileType + ": " + fileName);
};
exports.resetDir = function (dir) {
    var prismaDir = path_1.default.join(process.cwd(), dir);
    var datamodelDir = path_1.default.join(prismaDir, 'datamodel');
    fs_1.default.readdirSync(datamodelDir).forEach(function (file) { return fs_1.default.unlinkSync(path_1.default.join(datamodelDir, file)); });
};
exports.savePrismaYaml = function (datamodel, dir, endpoint, secret) {
    var prismaDir = path_1.default.join(process.cwd(), dir);
    var prismaYaml = path_1.default.join(prismaDir, "prisma.yml");
    var data = { endpoint: endpoint, datamodel: datamodel, };
    if (secret)
        data.secret = secret;
    saveYaml(prismaYaml, data);
};
exports.saveDockerComposeYaml = function (dir, port) {
    var prismaDir = path_1.default.join(process.cwd(), dir);
    var dcYaml = path_1.default.join(prismaDir, "docker-compose.yml");
    if (!fs_1.default.existsSync(dcYaml))
        return console.warn("\"" + dcYaml + "\" file does not exists");
    saveYaml(dcYaml, {
        services: {
            prisma: {
                ports: [port + ":" + port],
                environment: {
                    PRISMA_CONFIG: {
                        port: port,
                    }
                }
            }
        }
    });
};
var saveYaml = function (file, data) {
    var yaml = require("yaml");
    var contentFile = fs_1.default.readFileSync(file, { encoding: 'utf8' }).replace(/([\t ]*)PRISMA_CONFIG *: *(\||>)?\n/, '$1PRISMA_CONFIG:\n');
    var originalData = yaml.parse(contentFile) || {};
    delete originalData.datamodel;
    var newData = data;
    if (data.datamodel) {
        data.datamodel = Array.from(data.datamodel);
        newData = lodash_1.merge(originalData, data);
    }
    var str = yaml.stringify(newData).replace(/([\t ]*)PRISMA_CONFIG *: *\n/, '$1PRISMA_CONFIG: |\n');
    fs_1.default.writeFileSync(file, str);
};
exports.getSubSchemas = function (schema, processedSchemas) {
    if (processedSchemas === void 0) { processedSchemas = []; }
    var subSchemas = [];
    if (processedSchemas.includes(schema.name))
        return subSchemas;
    processedSchemas.push(schema.name);
    schema.getSubSchemas().forEach(function (field) {
        var fieldDefinition = schema.getPathDefinition(field);
        if (!fieldDefinition.isTable)
            return;
        if (!(fieldDefinition.form && fieldDefinition.form.props && fieldDefinition.form.props.query)) {
            var schemaName = fieldDefinition.type;
            subSchemas.push(schemaName);
            subSchemas.push.apply(subSchemas, exports.getSubSchemas(mandarina_1.Schema.getInstance(schemaName), processedSchemas));
        }
    });
    return subSchemas;
};
exports.getGraphQLOperation = function (action, schema) {
    var response = '', input = '';
    var actions = action.actions;
    if (action.schema) {
        var actionName = action.schema.name;
        input = schema ? "(data: " + utils_1.capitalize(actionName) + "Input!)" : '';
    }
    if (actions) {
        Object.keys(actions).forEach(function (actionName) {
            var action = actions[actionName];
            response += "extend type Mutation {\n\t" + actionName + " " + input + ": " + action.result + "\n}";
        });
    }
    return response;
};
exports.getAuthOperation = function () {
    return "extend type Query {\n\tAuthFields(action: String!, table: String!) :  [String!]\n}";
};
/*

export const getDeclarations = (schema: Schema): string => {
    const headers: string[] = []
    const path = require('path')
    const schemaDeclarationName = buildInterfaceName(schema)
    let declarations = [`export interface ${schemaDeclarationName} {`]
    for (const key of schema.keys) {
        const field = schema.getFieldDefinition(key)
        const optional = isRequired(field) || key === 'id' ? '' : '?'
        const fieldType = getDeclarationType(field.type, key);
        let schemaName: string = ""
        if (Array.isArray(field.type) && typeof field.type[0] === 'string') {
            schemaName = <string>field.type[0]
        }
        if (typeof field.type === 'string') schemaName = field.type
        if (schemaName) {
            const childSchema = Schema.getInstance(schemaName)
            const interfaceName = buildInterfaceName(schemaName)
            let dir = path.relative(schema.getFilePath(), childSchema.getFilePath())
            if (!dir) {
                dir = '.'
            } else if (dir.indexOf('.') !== 0) {
                dir = './' + dir
            }
            headers.push(`import { ${interfaceName} } from "${dir}/${interfaceName}"`);
        }
        field.description && declarations.push(`// ${field.description}`);
        declarations.push(`    ${key}${optional}: ${fieldType} ${optional ? ' | null' : ''}`);
    }
    declarations.push('}')
    return headers.concat(declarations).join('\n')
}
 */
//# sourceMappingURL=genFilesUtils.js.map